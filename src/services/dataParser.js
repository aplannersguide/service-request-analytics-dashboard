import Papa from 'papaparse';

/**
 * Allowed analytical columns for Data Minimization.
 * Unused spatial/location/metadata columns (e.g. Location, X, Y, Well Known ID, Layer IDs)
 * are stripped upon ingest so they are never retained in memory or browser storage.
 */
const ALLOWED_CSV_KEYS = new Set([
  // Request ID variants
  'Request ID', 'Request_ID', 'RequestId', 'SR ID', 'Ticket ID', 'ID',
  // Service Request fields
  'Service Request Type', 'Service_Request_Type',
  'Description',
  'Service Status', 'Service_Status', 'Status',
  'Service Owner Group', 'Service_Owner_Group', 'Unit',
  'Service Owner', 'Service_Owner', 'Assignee',
  'Priority',
  'Submission Type',
  'Follow-ups', 'Follow_ups', 'FollowUps',
  'Opened Date', 'Opened_Date', 'Created Date',
  'Due Date', 'Due_Date', 'Target Date',
  'Closed Date', 'Closed_Date', 'Completed Date',
  // Survey fields
  'Question', 'Survey Question', 'Prompt',
  'Answer', 'Response', 'Rating', 'Score', 'Value',
  'Submitted Date', 'Submitted_Date', 'Survey Date', 'Date'
]);

/**
 * Strips any column not explicitly required for dashboard analytics (Data Minimization)
 */
export function sanitizeRawRow(row) {
  if (!row || typeof row !== 'object') return {};
  const cleanRow = {};
  Object.keys(row).forEach((key) => {
    const trimmedKey = key.trim();
    if (ALLOWED_CSV_KEYS.has(trimmedKey)) {
      cleanRow[trimmedKey] = row[key];
    }
  });
  return cleanRow;
}

/**
 * Reads a File object handling UTF-16 / UTF-8 auto-detection.
 * Slices only the first 2 bytes for BOM detection to avoid double-buffering large files in memory.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const bomReader = new FileReader();

    bomReader.onload = (e) => {
      const buffer = e.target.result;
      const view = new DataView(buffer);
      
      let encoding = 'utf-8';
      
      // Check Byte Order Mark (BOM) for UTF-16 in the 2-byte slice
      if (buffer.byteLength >= 2) {
        const bom = view.getUint16(0, false);
        if (bom === 0xFEFF || bom === 0xFFFE) {
          encoding = 'utf-16';
        }
      }

      const textReader = new FileReader();
      textReader.onload = (evt) => resolve(evt.target.result);
      textReader.onerror = (err) => reject(err);
      textReader.readAsText(file, encoding);
    };

    bomReader.onerror = (err) => reject(err);
    bomReader.readAsArrayBuffer(file.slice(0, 2));
  });
}

/**
 * Parses raw CSV/TSV text string and enforces column whitelisting
 */
export function parseRawCSVText(text) {
  const newlineIdx = text.indexOf('\n');
  const firstLine = newlineIdx !== -1 ? text.slice(0, newlineIdx) : text;
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: delimiter
  });

  return Array.isArray(result.data) ? result.data.map(sanitizeRawRow) : [];
}

/**
 * Robust date parser for strings like "August 19, 2026 1:17 PM"
 */
export function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const cleaned = dateStr.trim();
  if (!cleaned) return null;
  
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;
  
  return null;
}

/**
 * Helper to extract Department Code from Request ID (e.g., DPU00001291284 -> DPU)
 */
export function extractDepartmentCode(reqId) {
  if (!reqId || typeof reqId !== 'string') return 'OTHER';
  const match = reqId.trim().match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : 'OTHER';
}

/**
 * Dynamically derives the dataset As-Of Date from the latest valid timestamp
 * across rawRequests and rawSurveys (falls back to Aug 25, 2026 if none found).
 */
export function computeDatasetAsOfDate(rawRequests = [], rawSurveys = []) {
  let maxTime = 0;

  if (Array.isArray(rawRequests)) {
    rawRequests.forEach((row) => {
      const opened = parseDate(row['Opened Date'] || row['Opened_Date'] || row['Created Date']);
      const closed = parseDate(row['Closed Date'] || row['Closed_Date'] || row['Completed Date']);
      if (opened && opened.getTime() > maxTime) maxTime = opened.getTime();
      if (closed && closed.getTime() > maxTime) maxTime = closed.getTime();
    });
  }

  if (Array.isArray(rawSurveys)) {
    rawSurveys.forEach((row) => {
      const submitted = parseDate(row['Submitted Date'] || row['Submitted_Date'] || row['Survey Date'] || row['Date']);
      if (submitted && submitted.getTime() > maxTime) maxTime = submitted.getTime();
    });
  }

  return maxTime > 0 ? new Date(maxTime) : new Date(2026, 7, 25);
}

/**
 * Main Data Transformation & Metric Processing Engine
 */
export function processRawDatasets(rawRequests, rawSurveys, asOfDate = null) {
  const now = asOfDate || computeDatasetAsOfDate(rawRequests, rawSurveys);

  // 1. Process Surveys and Group by Request ID (Flexible Schema Matching)
  const surveyMap = {};

  if (Array.isArray(rawSurveys)) {
    rawSurveys.forEach((row) => {
      const reqId = row['Request ID'] || row['Request_ID'] || row['RequestId'] || row['SR ID'] || row['Ticket ID'] || row['ID'];
      if (!reqId) return;

      const cleanedReqId = String(reqId).trim();
      const question = String(row['Question'] || row['Survey Question'] || row['Prompt'] || '').trim();
      const answer = String(row['Answer'] || row['Response'] || row['Rating'] || row['Score'] || row['Value'] || '').trim();
      const submittedDate = parseDate(row['Submitted Date'] || row['Submitted_Date'] || row['Survey Date'] || row['Date']);

      if (!surveyMap[cleanedReqId]) {
        surveyMap[cleanedReqId] = {
          csatScores: [],
          overallScores: [],
          explanationScores: [],
          qualityScores: [],
          comments: [],
          submittedDate: null
        };
      }

      if (submittedDate) {
        if (!surveyMap[cleanedReqId].submittedDate || submittedDate > surveyMap[cleanedReqId].submittedDate) {
          surveyMap[cleanedReqId].submittedDate = submittedDate;
        }
      }

      const num = parseFloat(answer);
      const isNumeric = !isNaN(num) && num >= 1 && num <= 10;
      const qLower = question.toLowerCase();

      const isCommentQuestion = qLower.includes('why') || 
                                qLower.includes('comment') || 
                                qLower.includes('feedback') || 
                                qLower.includes('reason') ||
                                qLower.includes('explain');

      if (isCommentQuestion || (!isNumeric && answer.length > 2)) {
        if (answer) {
          surveyMap[cleanedReqId].comments.push(answer);
        }
      } else if (isNumeric) {
        // Normalize 1-10 scale to 1-5 scale if needed
        const normalizedScore = num > 5 ? num / 2 : num;
        surveyMap[cleanedReqId].csatScores.push(normalizedScore);

        if (qLower.includes('overall')) {
          surveyMap[cleanedReqId].overallScores.push(normalizedScore);
        } else if (qLower.includes('explanation') || qLower.includes('what would happen')) {
          surveyMap[cleanedReqId].explanationScores.push(normalizedScore);
        } else if (qLower.includes('quality')) {
          surveyMap[cleanedReqId].qualityScores.push(normalizedScore);
        }
      }
    });
  }

  const avgArray = (arr) => {
    if (!arr || arr.length === 0) return null;
    const avg = arr.reduce((sum, val) => sum + val, 0) / arr.length;
    return Math.round(avg * 10) / 10;
  };

  // Calculate Composite & Dimension CSAT per request
  Object.keys(surveyMap).forEach((reqId) => {
    const entry = surveyMap[reqId];
    entry.avgCSAT = avgArray(entry.csatScores);
    entry.dimensions = {
      overall: avgArray(entry.overallScores),
      explanation: avgArray(entry.explanationScores),
      quality: avgArray(entry.qualityScores)
    };
  });

  // 2. Filter & Process Service Requests
  const processedRequests = [];

  rawRequests.forEach((row) => {
    const serviceType = row['Service Request Type'] || row['Service_Request_Type'] || '';
    const status = String(row['Service Status'] || row['Service_Status'] || row['Status'] || '').trim();
    const statusLower = status.toLowerCase();

    // Exclude informational Call Logs
    if (serviceType.toLowerCase().includes('citizen service and response - call log') ||
        serviceType.toLowerCase().includes('call log')) {
      return;
    }

    // Exclude Canceled / Duplicate requests from operational backlog & SLA metrics
    if (statusLower.includes('cancel') || statusLower.includes('duplicate')) {
      return;
    }

    const reqId = row['Request ID'] || row['Request_ID'] || row['RequestId'] || row['SR ID'] || row['Ticket ID'] || 'UNK00000';
    const cleanedReqId = String(reqId).trim();
    const department = extractDepartmentCode(cleanedReqId);
    const ownerGroup = row['Service Owner Group'] || row['Service_Owner_Group'] || row['Unit'] || 'Unassigned Owner Group';
    const owner = row['Service Owner'] || row['Service_Owner'] || row['Assignee'] || 'Unassigned';
    const priority = row['Priority'] || 'Normal';
    const submissionType = row['Submission Type'] || 'Portal';
    const followUps = Math.max(0, parseInt(row['Follow-ups'] || row['Follow_ups'] || row['FollowUps'] || '0', 10) || 0);

    const openedDate = parseDate(row['Opened Date'] || row['Opened_Date'] || row['Created Date']);
    const dueDate = parseDate(row['Due Date'] || row['Due_Date'] || row['Target Date']);
    const closedDate = parseDate(row['Closed Date'] || row['Closed_Date'] || row['Completed Date']);

    const isCompleted = statusLower.includes('completed') || statusLower.includes('closed');
    const isBacklog = !isCompleted;

    let targetSLADays = null;
    if (openedDate && dueDate) {
      targetSLADays = Math.max(0.1, (dueDate - openedDate) / (1000 * 60 * 60 * 24));
    }

    let resolutionDays = null;
    if (openedDate && closedDate) {
      resolutionDays = Math.max(0, (closedDate - openedDate) / (1000 * 60 * 60 * 24));
    }

    let backlogAgeDays = null;
    if (isBacklog && openedDate) {
      backlogAgeDays = Math.max(0, (now - openedDate) / (1000 * 60 * 60 * 24));
    }

    let isSLABreached = false;
    let breachType = 'None';

    if (isCompleted) {
      if (closedDate && dueDate && closedDate > dueDate) {
        isSLABreached = true;
        breachType = 'Closed Breach';
      } else {
        breachType = 'On Time';
      }
    } else {
      if (dueDate && now > dueDate) {
        isSLABreached = true;
        breachType = 'Open Breach';
      } else {
        breachType = 'Open On Schedule';
      }
    }

    const survey = surveyMap[cleanedReqId] || {
      avgCSAT: null,
      dimensions: { overall: null, explanation: null, quality: null },
      comments: [],
      submittedDate: null
    };

    processedRequests.push({
      id: cleanedReqId,
      department,
      serviceType: serviceType || 'Unspecified',
      description: row['Description'] || '',
      status: status || 'Open',
      isCompleted,
      isBacklog,
      ownerGroup,
      owner,
      priority,
      submissionType,
      followUps,
      openedDate,
      dueDate,
      closedDate,
      surveyDate: survey.submittedDate || closedDate,
      targetSLADays,
      resolutionDays,
      backlogAgeDays,
      isSLABreached,
      breachType,
      csatScore: survey.avgCSAT,
      csatDimensions: survey.dimensions,
      comments: survey.comments
    });
  });

  return processedRequests;
}

/**
 * Triggers a browser download of a UTF-8 BOM CSV file for seamless Microsoft Excel opening
 */
function triggerCSVDownload(csvText, filenamePrefix, recordCount) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const safePrefix = String(filenamePrefix || 'RVA_311_Export').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safePrefix}_${recordCount}-records_${dateStamp}.csv`;

  const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports an array of processed Service Requests as a pre-joined Enriched Action Sheet CSV
 */
export function exportRequestsToCSV(requests = [], filenamePrefix = 'RVA_311_Service_Requests') {
  if (!Array.isArray(requests) || requests.length === 0) return;

  const rows = requests.map(r => ({
    'Request ID': r.id || '',
    'Department': r.department || '',
    'Owner Group': r.ownerGroup || '',
    'Service Owner': r.owner || '',
    'Service Request Type': r.serviceType || '',
    'Priority': r.priority || '',
    'Service Status': r.status || '',
    'Opened Date': r.openedDate ? r.openedDate.toLocaleString() : '',
    'Due Date': r.dueDate ? r.dueDate.toLocaleString() : '',
    'Closed Date': r.closedDate ? r.closedDate.toLocaleString() : '',
    'SLA Breach Status': r.breachType || '',
    'Target SLA (Days)': r.targetSLADays !== null && r.targetSLADays !== undefined ? Number(r.targetSLADays.toFixed(1)) : '',
    'Actual Resolution (Days)': r.resolutionDays !== null && r.resolutionDays !== undefined ? Number(r.resolutionDays.toFixed(1)) : '',
    'Backlog Age (Days)': r.backlogAgeDays !== null && r.backlogAgeDays !== undefined ? Math.round(r.backlogAgeDays) : '',
    'Follow-Up Count': r.followUps ?? 0,
    'Composite CSAT (1-5)': r.csatScore ?? '',
    'Overall Satisfaction (1-5)': r.csatDimensions?.overall ?? '',
    'Process Explanation (1-5)': r.csatDimensions?.explanation ?? '',
    'Service Quality (1-5)': r.csatDimensions?.quality ?? '',
    'Survey Submitted Date': r.surveyDate ? r.surveyDate.toLocaleString() : '',
    'Resident Survey Comments': Array.isArray(r.comments) ? r.comments.join(' | ') : '',
    'Request Description': r.description || ''
  }));

  const csvText = Papa.unparse(rows, { escapeFormulae: true });
  triggerCSVDownload(csvText, filenamePrefix, rows.length);
}

/**
 * Exports filtered Customer Survey Feedback items as an Enriched CSAT Feedback CSV
 */
export function exportFeedbackCommentsToCSV(commentItems = [], filenamePrefix = 'RVA_311_CSAT_Feedback') {
  if (!Array.isArray(commentItems) || commentItems.length === 0) return;

  const rows = commentItems.map(item => ({
    'Request ID': item.reqId || '',
    'Department': item.dept || '',
    'Owner Group': item.ownerGroup || '',
    'Service Owner': item.owner || '',
    'Service Request Type': item.type || '',
    'Survey / Closed Date': item.surveyDate ? item.surveyDate.toLocaleString() : '',
    'Follow-Up Count': item.followUps ?? 0,
    'Composite CSAT (1-5)': item.csat ?? '',
    'Overall Satisfaction (1-5)': item.dimensions?.overall ?? '',
    'Process Explanation (1-5)': item.dimensions?.explanation ?? '',
    'Service Quality (1-5)': item.dimensions?.quality ?? '',
    'SLA Breach Status': item.breachType || '',
    'Resident Survey Comment': item.comment || ''
  }));

  const csvText = Papa.unparse(rows, { escapeFormulae: true });
  triggerCSVDownload(csvText, filenamePrefix, rows.length);
}

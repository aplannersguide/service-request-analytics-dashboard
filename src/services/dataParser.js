import Papa from 'papaparse';

/**
 * Reads a File object handling UTF-16 / UTF-8 auto-detection
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      let buffer = e.target.result;
      const view = new DataView(buffer);
      
      let encoding = 'utf-8';
      
      // Check Byte Order Mark (BOM) for UTF-16
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

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses raw CSV/TSV text string
 */
export function parseRawCSVText(text) {
  const firstLine = text.split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: delimiter
  });

  return result.data;
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
 * Main Data Transformation & Metric Processing Engine
 */
export function processRawDatasets(rawRequests, rawSurveys, now = new Date(2026, 7, 25)) {
  // 1. Process Surveys and Group by Request ID (Flexible Schema Matching)
  const surveyMap = {};

  if (Array.isArray(rawSurveys)) {
    rawSurveys.forEach((row) => {
      // Find Request ID column flexibly
      const reqId = row['Request ID'] || row['Request_ID'] || row['RequestId'] || row['SR ID'] || row['Ticket ID'] || row['ID'];
      if (!reqId) return;

      const cleanedReqId = String(reqId).trim();
      const question = String(row['Question'] || row['Survey Question'] || row['Prompt'] || '').trim();
      const answer = String(row['Answer'] || row['Response'] || row['Rating'] || row['Score'] || row['Value'] || '').trim();

      if (!surveyMap[cleanedReqId]) {
        surveyMap[cleanedReqId] = {
          csatScores: [],
          comments: [],
          raw: []
        };
      }

      surveyMap[cleanedReqId].raw.push(row);

      const num = parseFloat(answer);
      const isNumeric = !isNaN(num) && num >= 1 && num <= 10;
      
      const isCommentQuestion = question.toLowerCase().includes('why') || 
                                question.toLowerCase().includes('comment') || 
                                question.toLowerCase().includes('feedback') || 
                                question.toLowerCase().includes('reason') ||
                                question.toLowerCase().includes('explain');

      if (isCommentQuestion || (!isNumeric && answer.length > 2)) {
        if (answer) {
          surveyMap[cleanedReqId].comments.push(answer);
        }
      } else if (isNumeric) {
        // Normalize 1-10 scale to 1-5 scale if needed
        const normalizedScore = num > 5 ? num / 2 : num;
        surveyMap[cleanedReqId].csatScores.push(normalizedScore);
      }
    });
  }

  // Calculate Average CSAT per request
  Object.keys(surveyMap).forEach((reqId) => {
    const scores = surveyMap[reqId].csatScores;
    if (scores.length > 0) {
      const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      surveyMap[reqId].avgCSAT = Math.round(avg * 10) / 10;
    } else {
      surveyMap[reqId].avgCSAT = null;
    }
  });

  // 2. Filter & Process Service Requests
  const processedRequests = [];

  rawRequests.forEach((row) => {
    const serviceType = row['Service Request Type'] || row['Service_Request_Type'] || '';
    
    // Filter out Call Logs
    if (serviceType.toLowerCase().includes('citizen service and response - call log') ||
        serviceType.toLowerCase().includes('call log')) {
      return;
    }

    const reqId = row['Request ID'] || row['Request_ID'] || row['RequestId'] || row['SR ID'] || row['Ticket ID'] || 'UNK00000';
    const cleanedReqId = String(reqId).trim();
    const department = extractDepartmentCode(cleanedReqId);
    const status = row['Service Status'] || row['Service_Status'] || row['Status'] || '';
    const ownerGroup = row['Service Owner Group'] || row['Service_Owner_Group'] || row['Unit'] || 'Unassigned Group';
    const owner = row['Service Owner'] || row['Service_Owner'] || row['Assignee'] || 'Unassigned';
    const priority = row['Priority'] || 'Normal';
    const submissionType = row['Submission Type'] || 'Portal';

    const openedDate = parseDate(row['Opened Date'] || row['Opened_Date'] || row['Created Date']);
    const dueDate = parseDate(row['Due Date'] || row['Due_Date'] || row['Target Date']);
    const closedDate = parseDate(row['Closed Date'] || row['Closed_Date'] || row['Completed Date']);

    const isCompleted = status.toLowerCase().includes('completed');
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

    const survey = surveyMap[cleanedReqId] || { avgCSAT: null, comments: [] };

    processedRequests.push({
      id: cleanedReqId,
      department,
      serviceType: serviceType || 'Unspecified',
      description: row['Description'] || '',
      status,
      isCompleted,
      isBacklog,
      ownerGroup,
      owner,
      priority,
      submissionType,
      openedDate,
      dueDate,
      closedDate,
      targetSLADays,
      resolutionDays,
      backlogAgeDays,
      isSLABreached,
      breachType,
      csatScore: survey.avgCSAT,
      comments: survey.comments,
      rawRequest: row
    });
  });

  return processedRequests;
}

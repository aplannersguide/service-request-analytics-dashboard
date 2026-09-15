// Mock Dataset matching exact schema of Service Requests.csv and Service Request Surveys.csv

const DEPARTMENTS = ["DPU", "DOF", "DPW", "DPR", "APD"];
const OWNER_GROUPS = ["Business Unit", "Public Works", "IT & Technology", "Finance & Revenue", "Code Enforcement"];
const REQUEST_TYPES = {
  "Business Unit": ["Business Professional and Occupational Licenses", "Commercial Entity Registration", "Special Event Authorization"],
  "Public Works": ["Pothole Repair", "Streetlight Maintenance", "Trash & Recycling Pickup"],
  "IT & Technology": ["Workstation Setup", "Software License Provisioning", "VPN & Network Access"],
  "Finance & Revenue": ["Property Tax Appeal", "Utility Billing Dispute", "Vendor Invoice Query"],
  "Code Enforcement": ["Building Permit Inspection", "Noise Violation Complaint", "Zoning Compliance"]
};

const OWNERS = {
  "Business Unit": ["Sarah Jenkins", "David Chen"],
  "Public Works": ["Marcus Brody", "Tom Bradley"],
  "IT & Technology": ["Elena Rostova", "Alex Rivera"],
  "Finance & Revenue": ["Jessica Vance", "Robert Paulson"],
  "Code Enforcement": ["Maria Santos", "Kevin Wright"]
};

const COMMENTS_NEGATIVE = [
  "Resolution took over 3 weeks past the target date with zero updates.",
  "No one responded until I sent multiple follow-up emails.",
  "Service level was unacceptable, task was marked complete before actual fix.",
  "Backlog seems huge, delayed my business license launch.",
  "Lack of communication regarding SLA delays."
];

const COMMENTS_POSITIVE = [
  "Fantastic support! Fixed my request within hours.",
  "Very clear explanation and polite officer.",
  "Exceeded expectations, smooth process.",
  "Quick resolution, very satisfied with the service quality."
];

export function generateMockDataset() {
  const requests = [];
  const surveys = [];
  
  const now = new Date(2026, 7, 25);
  let idCounter = 127485;

  // Add 15 Call Log items to verify exclusion filter
  for (let c = 0; c < 15; c++) {
    const callLogId = `CSR000${idCounter++}`;
    requests.push({
      "Request ID": callLogId,
      "Service Request Type": "Department of Citizen Service and Response - Call Log",
      "Description": "Inbound citizen call inquiry logged",
      "Closed Date": "August 15, 2026 10:00 AM",
      "Opened Date": "August 15, 2026 09:30 AM",
      "Location": "Call Center",
      "Priority": "Low",
      "Service Status": "Completed",
      "Due Date": "August 16, 2026 09:30 AM",
      "Submission Type": "Phone",
      "Dispatcher": "Call Center Agent",
      "Service Owner Group": "Citizen Response",
      "Service Owner": "Agent Smith",
      "Follow-ups": "0"
    });
  }

  for (let i = 0; i < 150; i++) {
    const deptPrefix = DEPARTMENTS[i % DEPARTMENTS.length];
    const id = `${deptPrefix}000${idCounter++}`;
    const group = OWNER_GROUPS[i % OWNER_GROUPS.length];
    const types = REQUEST_TYPES[group];
    const reqType = types[i % types.length];
    const ownerList = OWNERS[group];
    const owner = ownerList[i % ownerList.length];

    const daysAgo = Math.floor(Math.random() * 120);
    const openedDate = new Date(now.getTime() - daysAgo * 86400000 - Math.random() * 36000000);
    
    const targetDays = 3 + (i % 6);
    const dueDate = new Date(openedDate.getTime() + targetDays * 86400000);

    const isCompleted = Math.random() > 0.35;
    let serviceStatus = "Completed";
    let closedDate = null;

    if (!isCompleted) {
      const statuses = ["In Progress", "Pending Review", "Assigned", "Under Investigation"];
      serviceStatus = statuses[i % statuses.length];
    } else {
      const isBreach = Math.random() < 0.42;
      let durationDays = targetDays;
      if (isBreach) {
        durationDays = targetDays + 2 + Math.floor(Math.random() * 10);
      } else {
        durationDays = Math.max(1, targetDays - Math.floor(Math.random() * 2));
      }
      closedDate = new Date(openedDate.getTime() + durationDays * 86400000);
    }

    const priorityOptions = ["High", "Medium", "Low", "Critical"];
    const priority = priorityOptions[i % priorityOptions.length];

    const submissionOptions = ["InternalPortal", "WebForm", "Phone", "Email"];
    const submissionType = submissionOptions[i % submissionOptions.length];

    const formatDate = (d) => {
      if (!d) return "";
      return d.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    requests.push({
      "Request ID": id,
      "Service Request Type": reqType,
      "Description": `Service request for ${reqType.toLowerCase()} - ref #${id.slice(-4)}`,
      "Closed Date": formatDate(closedDate),
      "Opened Date": formatDate(openedDate),
      "Location": "District 4 Office",
      "Priority": priority,
      "Service Status": serviceStatus,
      "Due Date": formatDate(dueDate),
      "Submission Type": submissionType,
      "Dispatcher": "Central Dispatch",
      "Service Owner Group": group,
      "Service Owner": owner,
      "Follow-ups": String(Math.floor(Math.random() * 3))
    });

    if (isCompleted && Math.random() < 0.85) {
      const isSLAWrittenBreached = closedDate > dueDate;
      
      let score1, score2, score3;
      let comment = "";

      if (isSLAWrittenBreached) {
        score1 = Math.min(5, Math.max(1, 1 + Math.floor(Math.random() * 3)));
        score2 = Math.min(5, Math.max(1, 1 + Math.floor(Math.random() * 3)));
        score3 = Math.min(5, Math.max(1, 2 + Math.floor(Math.random() * 2)));
        comment = COMMENTS_NEGATIVE[i % COMMENTS_NEGATIVE.length];
      } else {
        score1 = Math.min(5, Math.max(3, 4 + Math.floor(Math.random() * 2)));
        score2 = Math.min(5, Math.max(3, 4 + Math.floor(Math.random() * 2)));
        score3 = Math.min(5, Math.max(3, 4 + Math.floor(Math.random() * 2)));
        comment = COMMENTS_POSITIVE[i % COMMENTS_POSITIVE.length];
      }

      const surveyDate = new Date(closedDate.getTime() + Math.random() * 43200000);

      surveys.push(
        {
          "Request ID": id,
          "Question": "What was your overall satisfaction with your service request?",
          "Answer": String(score1),
          "Submitted Date": formatDate(surveyDate)
        },
        {
          "Request ID": id,
          "Question": "How satisfied are you with the explanation of what would happen after you submitted the request?",
          "Answer": String(score3),
          "Submitted Date": formatDate(surveyDate)
        },
        {
          "Request ID": id,
          "Question": "How satisfied are you with the quality of the service provided?",
          "Answer": String(score2),
          "Submitted Date": formatDate(surveyDate)
        },
        {
          "Request ID": id,
          "Question": "Tell us why you gave us these ratings?",
          "Answer": comment,
          "Submitted Date": formatDate(surveyDate)
        }
      );
    }
  }

  return { requests, surveys };
}

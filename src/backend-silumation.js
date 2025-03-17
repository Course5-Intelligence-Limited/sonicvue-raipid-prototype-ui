const express = require('express');
const app = express();
const port = 8000;

// Sample data
const sampleData = [
  {
    filename: "audio__1.wav",
    call_time: "428",
    hold: "No",
    hold_satisfaction: "Yes",
    hold_time: "0",
    multiple_agents: "No",
    route_time: "22",
    resolution_time: "123",
    resolution_time_start: "305",
    greeting: "Yes",
    phone_number: "Yes",
    email_address: "Yes",
    call_quality: "No",
    case_type: "New",
    resolution_confirmation: "Yes",
    escalation: "No",
    call_tone: "Positive",
    issue_discussed: "Report issue",
    complexity: "Intermediate",
    issue_type: "Technical",
    status_query: "No",
    call_type: "Incident",
    replacement_required: "No",
    part_request: "No",
    parts_dispatch: "No",
    field_service: "No",
    digital_service: "No"
  },
  {
    filename: "audio__2.wav",
    call_time: "311",
    hold: "No",
    hold_satisfaction: "Yes",
    hold_time: "0",
    multiple_agents: "No",
    route_time: "12",
    resolution_time: "45",
    resolution_time_start: "244",
    greeting: "Yes",
    phone_number: "Yes",
    email_address: "Yes",
    call_quality: "Yes",
    case_type: "Existing",
    resolution_confirmation: "Yes",
    escalation: "Yes",
    call_tone: "Negative",
    issue_discussed: "Touch screen",
    complexity: "Difficult",
    issue_type: "Technical",
    status_query: "No",
    call_type: "Incident",
    replacement_required: "No",
    part_request: "No",
    parts_dispatch: "No",
    field_service: "Yes",
    digital_service: "No"
  },
  {
    filename: "audio__3.wav",
    call_time: "256",
    hold: "Yes",
    hold_satisfaction: "No",
    hold_time: "30",
    multiple_agents: "Yes",
    route_time: "18",
    resolution_time: "98",
    resolution_time_start: "140",
    greeting: "Yes",
    phone_number: "No",
    email_address: "No",
    call_quality: "Yes",
    case_type: "New",
    resolution_confirmation: "No",
    escalation: "No",
    call_tone: "Neutral",
    issue_discussed: "Software update",
    complexity: "Easy",
    issue_type: "Software",
    status_query: "Yes",
    call_type: "Service Request",
    replacement_required: "No",
    part_request: "No",
    parts_dispatch: "No",
    field_service: "No",
    digital_service: "Yes"
  }
];

// Helper function to filter data
const filterData = (data, modality, complexity, eventType) => {
  return data.filter(item => 
    (modality === undefined || item.modality === modality) &&
    (complexity === undefined || item.complexity === complexity || (complexity === 'Medium' && item.complexity === 'Intermediate')) &&
    (eventType === undefined || item.call_type === eventType)
  );
};

// Dashboard data endpoint
app.get('/dashboard-data', (req, res) => {
  const { modality, complexity, eventType } = req.query;
  const filteredData = filterData(sampleData, modality, complexity, eventType);
  
  // Calculate metrics based on filteredData
  const metrics = {
    summary: {
      total_calls: filteredData.length,
      call_routing_accuracy: filteredData.filter(item => item.route_time !== "0").length / filteredData.length * 100,
      multiple_agents: filteredData.filter(item => item.multiple_agents === "Yes").length / filteredData.length * 100,
      call_hold_percentage: filteredData.filter(item => item.hold === "Yes").length / filteredData.length * 100,
      escalated_calls: filteredData.filter(item => item.escalation === "Yes").length / filteredData.length * 100,
      resolution_confirmation: filteredData.filter(item => item.resolution_confirmation === "Yes").length / filteredData.length * 100,
      cs_portal_recommended: filteredData.filter(item => item.digital_service === "Yes").length / filteredData.length * 100
    },
    complexity: {
      easy: filteredData.filter(item => item.complexity === "Easy").length,
      intermediate: filteredData.filter(item => item.complexity === "Intermediate").length,
      difficult: filteredData.filter(item => item.complexity === "Difficult").length
    },
    call_hygiene: {
      greeting: filteredData.filter(item => item.greeting === "Yes").length / filteredData.length * 100,
      phone_number: filteredData.filter(item => item.phone_number === "Yes").length / filteredData.length * 100,
      email: filteredData.filter(item => item.email_address === "Yes").length / filteredData.length * 100
    },
    tone_conversation: {
      positive: filteredData.filter(item => item.call_tone === "Positive").length,
      neutral: filteredData.filter(item => item.call_tone === "Neutral").length,
      negative: filteredData.filter(item => item.call_tone === "Negative").length
    },
    event_type: filteredData.reduce((acc, item) => {
      acc[item.call_type] = (acc[item.call_type] || 0) + 1;
      return acc;
    }, {}),
    customer_service: {
      parts_request: filteredData.filter(item => item.part_request === "Yes").length / filteredData.length * 100,
      digital_service: filteredData.filter(item => item.digital_service === "Yes").length / filteredData.length * 100,
      field_visits: filteredData.filter(item => item.field_service === "Yes").length / filteredData.length * 100
    },
    root_cause_analysis: {
      hold_time: filteredData.reduce((sum, item) => sum + parseInt(item.hold_time), 0),
      resolution_time: filteredData.reduce((sum, item) => sum + parseInt(item.resolution_time), 0),
      route_time: filteredData.reduce((sum, item) => sum + parseInt(item.route_time), 0)
    }
  };
  
  // Calculate percentages for root_cause_analysis
  const totalTime = metrics.root_cause_analysis.hold_time + metrics.root_cause_analysis.resolution_time + metrics.root_cause_analysis.route_time;
  metrics.root_cause_analysis.hold_time = (metrics.root_cause_analysis.hold_time / totalTime) * 100;
  metrics.root_cause_analysis.resolution_time = (metrics.root_cause_analysis.resolution_time / totalTime) * 100;
  metrics.root_cause_analysis.route_time = (metrics.root_cause_analysis.route_time / totalTime) * 100;

  res.json(metrics);
});

// Table data endpoint
app.get('/table-data', (req, res) => {
  const { modality, complexity, eventType } = req.query;
  const filteredData = filterData(sampleData, modality, complexity, eventType);
  res.json(filteredData);
});

// Transcripts endpoint (simulated)
app.get('/generate_transcripts', (req, res) => {
  const { files } = req.query;
  const fileList = files.split(',');
  const transcripts = fileList.map(filename => ({
    filename,
    transcript: `This is a simulated transcript for ${filename}`,
    status: 'completed'
  }));
  res.json(transcripts);
});

app.listen(port, () => {
  console.log(`Backend simulation running on port ${port}`);
});


export interface DashboardData {
    summary: {
      total_calls: number;
      call_routing_accuracy: number;
      multiple_agents: number;
      call_hold_percentage: number;
      escalated_calls: number;
      resolution_confirmation: number;
      cs_portal_recommended: number;
    };
    complexity: {
      easy: number;
      intermediate: number;
      difficult: number;
    };
    call_hygiene: {
      greeting: number;
      phone_number: number;
      email: number;
    };
    tone_conversation: {
      positive: number;
      neutral: number;
      negative: number;
    };
    event_type: {
      [key: string]: number;
    };
    customer_service: {
      parts_request: number;
      digital_service: number;
      field_visits: number;
    };
    root_cause_analysis: {
      hold_time: number;
      resolution_time: number;
      route_time: number;
    };
  }
  
  export interface TableData {
    [key: string]: string | number | boolean | undefined;
    filename: string;
    call_time: string;
    hold_time: string;
    route_time: string;
    resolution_time: string;
    greeting: boolean;
    phone_number: boolean;
    email_address: boolean;
    call_quality: string;
    case_type: string;
    resolution_confirmation: boolean;
    hold: boolean;
    hold_satisfaction: string;
    multiple_agents: boolean;
    escalation: boolean;
    call_tone: string;
    issue_discussed: string;
    complexity: string;
    issue_type: string;
    status_query: boolean;
    call_type: string;
    replacement_required: boolean;
    part_request: boolean;
    parts_dispatch: boolean;
    refund_required: boolean;
    field_service: boolean;
    digital_service: boolean;
    transcript?: string;
    transcriptStatus?: string;
  }
  
  export interface Column {
    key: string;
    label: string;
    width: string;
    backgroundColor: string;
    color: string;
  }
  
  
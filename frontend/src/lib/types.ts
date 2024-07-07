// types.ts
export interface DisasterList {
  id: number;
  name: string;
  status: "alert" | "ongoing";
  date_event: string;
  date_changed: string;
  primary_country?: { name: string; location: { lat: number; lon: number } };
  primary_type?: { name: string };
  report_analysis?: any;
}

export interface DisasterDetail extends DisasterList {
  description?: string;
  url?: string;
  url_alias?: string;
  date_created: string;
  glide?: string;
  affected_countries?: { name: string }[];
  related_glide?: any[];
  report_analysis?: {
    latest_report_id: number;
    latest_report_title: string;
    latest_report_date: string;
    type: string;
    analysis: {
      executive_summary?: string;
      timeline?: {
        events: Array<{
          date: string;
          description: string;
        }>;
      };
      impact_analysis?: {
        affected_people?: number;
        economic_impact?: string;
        infrastructure_damage?: string;
      };
      needs_analysis?: {
        immediate_needs?: string[];
        long_term_needs?: string[];
        resource_gaps?: string[];
      };
    };
  };
  map_analysis?: {
    disaster_id: number;
    latest_map_date: string;
    type: string;
    analysis: {
      executive_summary: string;
      affected_areas: string[];
      main_insights: string[];
    };
  };
}

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
    latest_report_url: string;
    latest_report_sources?: Array<{
      href: string;
      id: number;
      name: string;
      shortname: string;
      longname: string;
      spanish_name?: string;
      homepage: string;
      disclaimer?: string;
      type: {
        id: number;
        name: string;
      };
    }>;
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
        affected_people?: number | null;
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
    latest_map_title: string;
    latest_map_date: string;
    latest_map_url: string;
    latest_map_image_url: string;
    type: string;
    analysis: {
      disaster_extent: string;
      affected_areas: string[];
      key_findings: string[];
    };
  };
  news_analysis?: {
    disaster_id: number;
    type: string;
    latest_news_title: string;
    latest_news_date: string;
    latest_news_content: string;
    latest_news_url: string;
  };
}

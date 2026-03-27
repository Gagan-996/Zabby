export interface BusinessDetailResponse {
  success: boolean;
  message: string;
  data: BusinessDetail;
}

export interface BusinessDetail {
  business_name: string;
  slug: string;
  business_phone_number: string;
  address: string;
  landmark: string | null;
  area: string;
  city: string;
  description: string;
  profile_image_path: string | null;
  location: BusinessLocation | null;
  is_open: boolean;
  open_status: string;
  labels: BusinessLabels;
  badge_labels: string[];
  categories: BusinessCategory[];
  working_hours: WorkingHour[];
  images: string[];
}

export interface BusinessLocation {
  lat: number;
  lng: number;
}

export interface BusinessLabels {
  listed_by: string | null;
  claimed: string | null;
  verified: string | null;
  trusted: string | null;
}

export interface BusinessCategory {
  name: string;
  slug: string;
  offerings: BusinessOffering[];
}

export interface BusinessOffering {
  name: string;
  slug: string;
}

export interface WorkingHour {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: number;
}

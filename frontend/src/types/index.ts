export type UserRole = 'admin' | 'reporter' | 'shelter';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  shelter_profile?: ShelterProfile;
}

export interface ShelterProfile {
  id: number;
  user_id: number;
  shelter_name: string;
  description?: string;
  address?: string;
  is_verified: boolean;
  raw_lat?: number;
  raw_lng?: number;
  masked_lat?: number;
  masked_lng?: number;
  donation_link?: string;
  adoption_policy?: string;
  verification_doc_path?: string;
  user?: User;
}

export type PetType = 'cat' | 'dog';
export type PetCondition = 'healthy' | 'injured' | 'critical';
export type PetAgeGroup = 'kitten_puppy' | 'adult' | 'senior';
export type ReportStatus = 'available' | 'screening' | 'rescued' | 'adopted';

export interface ReportImage {
  id: number;
  report_id: number;
  image_path: string;
  thumbnail_path?: string;
  is_primary: boolean;
  image_url: string;
  thumbnail_url: string;
}

export type ActivityType = 'fed' | 'sighted' | 'treated' | 'secured' | 'adopted' | 'moved_location';

export interface ReportActivity {
  id: number;
  report_id: number;
  user_id: number;
  activity_type: ActivityType;
  notes?: string;
  photo_path?: string;
  photo_url?: string;
  last_latitude?: number;
  last_longitude?: number;
  created_at: string;
  user?: User;
}

export interface Report {
  id: number;
  user_id: number;
  pet_type: PetType;
  age_group: PetAgeGroup;
  condition: PetCondition;
  pet_count: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address_note?: string;
  is_masked: boolean;
  status: ReportStatus;
  distance_meters?: number;
  managed_by_shelter_id?: number;
  report_flags_count?: number;
  is_hidden?: boolean;
  created_at: string;
  updated_at: string;
  images: ReportImage[];
  user?: User;
  managed_by_shelter?: ShelterProfile;
  activities?: ReportActivity[];
  latest_activity?: ReportActivity;
  adoption_applications?: AdoptionApplication[];
  adoption_applications_count?: number;
}

export interface ScreeningAnswers {
  housing_type: string;
  housing_permit: boolean;
  pet_history: string;
  financial_readiness: boolean;
  sterilization_commitment: boolean;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface AdoptionApplication {
  id: number;
  report_id: number;
  adopter_id: number;
  screening_answers: ScreeningAnswers;
  notes?: string;
  status: ApplicationStatus;
  reviewed_at?: string;
  created_at: string;
  report?: Report;
  adopter?: User;
}

export interface Message {
  id: number;
  report_id?: number;
  sender_id: number;
  receiver_id: number;
  message?: string;
  attachment_url?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
  report?: Report;
}

export interface Conversation {
  other_user: User;
  report?: Report;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Advertisement {
  id: number;
  brand_name: string;
  title: string;
  description?: string;
  banner_url: string;
  target_url: string;
  placement: 'explore_sidebar' | 'report_detail' | 'landing_sponsor' | 'global_popup';
  cta_text: string;
  is_active: boolean;
  impression_count: number;
  click_count: number;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
}

export interface Contributor {
  id: number;
  name: string;
  role: UserRole;
  avatar?: string;
  badge: string;
  badge_key: string;
  points: number;
  reports_count: number;
  fed_count: number;
  rescue_count: number;
  total_actions: number;
}

export const TYPES_VERSION = '1.0.0';
export default {};


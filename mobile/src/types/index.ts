export type UserRole = 'admin' | 'reporter' | 'shelter';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
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
  thumbnail_url?: string;
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
  report_flags_count?: number;
  created_at: string;
  images: ReportImage[];
  user?: User;
  activities?: ReportActivity[];
}

export interface Conversation {
  id: number;
  with_user: User;
  report?: Report;
  last_message: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: number;
  };
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  report_id?: number;
  content: string;
  is_read: boolean;
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

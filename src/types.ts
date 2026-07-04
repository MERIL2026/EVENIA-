/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'organizer' | 'volunteer' | 'participant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college?: string;
  company?: string;
  department?: string;
  gender?: string;
  age?: number;
  avatar?: string;
  phone?: string;
}

export type EventCategory = 'hackathon' | 'coding' | 'gaming' | 'workshop' | 'seminar' | 'cultural' | 'sports' | 'conference' | 'community';

export interface EventFAQ {
  q: string;
  a: string;
}

export interface EventSpeaker {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  banner: string;
  logo?: string;
  venue: string;
  google_map_url?: string;
  date: string;
  time: string;
  capacity: number;
  price: number;
  registration_deadline: string;
  contact_number: string;
  email: string;
  website?: string;
  social_media?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  faq: EventFAQ[];
  sponsors: string[];
  speakers: EventSpeaker[];
  created_by: string;
  status: 'active' | 'pending' | 'cancelled';
  rating?: number;
  customQuestions?: string[];
  currency?: string;
  budget?: { category: string; estimated: number; actual: number; }[];
}

export type TicketType = 'free' | 'paid' | 'vip' | 'student' | 'early_bird' | 'group';

export interface Ticket {
  id: string;
  registration_id: string;
  ticket_type: TicketType;
  price: number;
  qr_code: string;
  seat_number: string;
  status: 'valid' | 'used' | 'cancelled';
  check_in_time?: string;
  check_out_time?: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  ticket_id: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  registration_date: string;
  fields: {
    name: string;
    email: string;
    phone: string;
    college?: string;
    company?: string;
    department?: string;
    gender?: string;
    age?: number;
    address?: string;
    id_url?: string;
    resume_url?: string;
    custom_answers?: Record<string, string>;
  };
}

export type PaymentGateway = 'stripe' | 'razorpay' | 'paypal' | 'cash' | 'upi';

export interface Payment {
  id: string;
  registration_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  gateway: PaymentGateway;
  transaction_id: string;
  date: string;
}

export type CertificateType = 'participation' | 'winner' | 'speaker' | 'volunteer' | 'organizer';

export interface Certificate {
  id: string;
  registration_id: string;
  event_id: string;
  recipient_name: string;
  certificate_type: CertificateType;
  title: string;
  issue_date: string;
  url: string;
}

export interface Feedback {
  id: string;
  registration_id: string;
  event_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  overall_experience: number;
  venue_rating: number;
  food_rating: number;
  speaker_rating: number;
  comments: string;
  suggestions?: string;
  date: string;
}

export interface VolunteerAssignment {
  id: string;
  event_id: string;
  user_id: string;
  status: 'assigned' | 'active' | 'completed';
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

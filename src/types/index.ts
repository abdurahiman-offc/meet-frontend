// Shared TypeScript types for the Meet application

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface Meeting {
  id: string;
  meeting_id: string;
  host_id: string;
  title: string;
  status: "created" | "live" | "ended";
  created_at: string;
  ended_at: string | null;
  join_url: string;
}

export interface JoinTokenResponse {
  token: string;
  livekit_url: string;
  meeting: Meeting;
  role: "host" | "attendee";
  session_id: string;
}

export interface ParticipantInfo {
  user_id: string;
  name: string;
  picture: string;
  role: "host" | "attendee";
  livekit_identity: string;
  joined_at: string;
  is_active: boolean;
}

export type MeetingStatus = "created" | "live" | "ended";
export type ParticipantRole = "host" | "attendee";

export interface ScheduleCalendarResponse {
  meeting: Meeting;
  calendar_template_url: string;
  calendar_event_link?: string | null;
  created_in_google_calendar: boolean;
}

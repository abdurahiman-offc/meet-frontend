import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Meeting, JoinTokenResponse, ParticipantInfo, User, ScheduleCalendarResponse } from "@/types";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return `${window.location.protocol}//${host}:8000`;
      }
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    headers: { "Content-Type": "application/json" },
  });

  // Attach baseURL and JWT from localStorage on every request
  client.interceptors.request.use((config) => {
    config.baseURL = `${getApiBaseUrl()}/api/v1`;
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("meet_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Handle 401 — clear token and redirect to login
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("meet_token");
        localStorage.removeItem("meet_user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const api = createApiClient();

// ── Auth ──────────────────────────────────────────────────────────────────────

export function getGoogleLoginUrl(): string {
  return `${getApiBaseUrl()}/api/v1/auth/google`;
}

export function getDevLoginUrl(email: string = "host@example.com", name: string = "Host User"): string {
  return `${getApiBaseUrl()}/api/v1/auth/dev-login?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

// ── Meetings ──────────────────────────────────────────────────────────────────

export async function createMeeting(title: string = ""): Promise<Meeting> {
  const res = await api.post<Meeting>("/meetings", { title });
  return res.data;
}

export async function scheduleCalendarMeeting(
  title: string = "Meet Video Meeting",
  startTime?: string,
  endTime?: string
): Promise<ScheduleCalendarResponse> {
  const res = await api.post<ScheduleCalendarResponse>("/meetings/schedule-calendar", {
    title,
    start_time: startTime,
    end_time: endTime,
  });
  return res.data;
}

export async function getMyMeetings(): Promise<Meeting[]> {
  const res = await api.get<Meeting[]>("/meetings/my");
  return res.data;
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const res = await api.get<Meeting>(`/meetings/${meetingId}`);
  return res.data;
}

export async function joinMeeting(meetingId: string): Promise<JoinTokenResponse> {
  const res = await api.post<JoinTokenResponse>(`/meetings/${meetingId}/join`);
  return res.data;
}

export async function leaveMeeting(meetingId: string): Promise<void> {
  await api.post(`/meetings/${meetingId}/leave`);
}

export async function endMeeting(meetingId: string): Promise<void> {
  await api.post(`/meetings/${meetingId}/end`);
}

export async function listParticipants(meetingId: string): Promise<ParticipantInfo[]> {
  const res = await api.get<ParticipantInfo[]>(`/meetings/${meetingId}/participants`);
  return res.data;
}

export async function removeParticipant(meetingId: string, userId: string): Promise<void> {
  await api.delete(`/meetings/${meetingId}/participants/${userId}`);
}

export default api;

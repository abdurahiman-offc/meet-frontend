"use client";

import { useState, useEffect } from "react";
import { Meeting } from "@/types";
import { getMeeting } from "@/lib/api";

export function useMeeting(meetingId: string | null) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        setIsLoading(true);
        const m = await getMeeting(meetingId);
        if (!cancelled) {
          setMeeting(m);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 404) setError("not_found");
          else if (status === 403) setError("ended");
          else setError("unknown");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [meetingId]);

  return { meeting, isLoading, error };
}

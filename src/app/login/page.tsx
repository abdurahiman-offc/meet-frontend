"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getGoogleLoginUrl, getDevLoginUrl } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = localStorage.getItem("meet_token");
    if (token) router.replace("/dashboard");
  }, [router]);

  const errorParam = searchParams.get("error");

  const getErrorMessage = (code: string | null) => {
    if (!code) return null;
    switch (code) {
      case "google_not_configured":
        return {
          title: "Google OAuth Setup Required",
          description:
            "Google credentials are not set in backend/.env. Add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET, or use Quick Dev Mode Sign-In below.",
          type: "warning",
        };
      case "access_denied":
        return {
          title: "Sign-In Cancelled",
          description: "Google account sign-in was cancelled or access was denied.",
          type: "info",
        };
      case "invalid_state":
        return {
          title: "Security Check Failed",
          description: "OAuth CSRF state verification failed. Please try signing in again.",
          type: "error",
        };
      case "auth_failed":
        return {
          title: "Authentication Failed",
          description:
            "Unable to complete authentication with Google. Please verify your Google Cloud OAuth settings and try again.",
          type: "error",
        };
      case "missing_code":
        return {
          title: "Missing Auth Code",
          description: "Google did not return an authorization code. Please try again.",
          type: "error",
        };
      default:
        return {
          title: "Sign-In Error",
          description: `An error occurred: ${code}`,
          type: "error",
        };
    }
  };

  const errorInfo = getErrorMessage(errorParam);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500 rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500 rounded-full opacity-[0.06] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo + Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-6">
            <svg
              className="w-8 h-8 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Meet</h1>
          <p className="text-[hsl(215,15%,55%)] text-base">
            HD video meetings in your browser. No downloads required.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2 text-center">Sign in to continue</h2>
          <p className="text-[hsl(215,15%,55%)] text-sm text-center mb-6">
            Use your Google account to create and join meetings
          </p>

          {/* Feedback/Error Notification */}
          {errorInfo && (
            <div
              className={`mb-6 p-4 rounded-xl border text-sm flex items-start gap-3 animate-fade-in ${
                errorInfo.type === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : errorInfo.type === "info"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                  : "bg-red-500/10 border-red-500/30 text-red-200"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-xs tracking-wide uppercase mb-0.5">
                  {errorInfo.title}
                </p>
                <p className="text-xs leading-relaxed opacity-90">{errorInfo.description}</p>
              </div>
            </div>
          )}

          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={isRedirecting}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isRedirecting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                Connecting to Google…
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Quick Dev Sign-in for immediate local testing */}
          <div className="mt-5 pt-4 border-t border-[hsl(220,15%,20%)] text-center">
            <p className="text-[11px] uppercase tracking-wider text-[hsl(215,15%,45%)] font-semibold mb-2.5">
              Quick Dev Mode Sign-In
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="dev-login-host-btn"
                onClick={() => {
                  window.location.href = getDevLoginUrl("host@example.com", "Host User");
                }}
                className="py-2 px-3 rounded-xl text-xs font-medium bg-[hsl(220,20%,14%)] hover:bg-[hsl(220,20%,18%)] border border-[hsl(220,15%,22%)] text-[hsl(210,20%,90%)] transition-colors hover:border-brand-500/40"
              >
                Sign in as Host
              </button>
              <button
                type="button"
                id="dev-login-attendee-btn"
                onClick={() => {
                  window.location.href = getDevLoginUrl("attendee@example.com", "Attendee User");
                }}
                className="py-2 px-3 rounded-xl text-xs font-medium bg-[hsl(220,20%,14%)] hover:bg-[hsl(220,20%,18%)] border border-[hsl(220,15%,22%)] text-[hsl(210,20%,90%)] transition-colors hover:border-brand-500/40"
              >
                Sign in as Attendee
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[hsl(220,15%,20%)] space-y-2">
            <p className="text-xs text-[hsl(215,10%,50%)] text-center leading-relaxed">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#8ab4f8] hover:text-[#aecbfa] underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#8ab4f8] hover:text-[#aecbfa] underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-[11px] text-[hsl(215,10%,40%)] text-center">
              Direct WebRTC audio & video &bull; Support:{" "}
              <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline">
                abdurahimanoffc@gmail.com
              </a>{" "}
              &bull;{" "}
              <a href="tel:+919544499352" className="text-[#8ab4f8] hover:underline">
                9544499352
              </a>
            </p>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex justify-center gap-6 mt-8 flex-wrap">
          {["HD Video", "Screen Share", "No Install"].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 text-[hsl(215,15%,50%)] text-xs"
            >
              <svg
                className="w-3.5 h-3.5 text-[hsl(142,70%,45%)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

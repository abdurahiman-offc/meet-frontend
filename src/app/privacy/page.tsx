import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Meet",
  description:
    "Privacy Policy and Google Cloud OAuth 2.0 User Data Disclosure for Meet video conferencing application.",
};

const TOC_ITEMS = [
  { id: "overview", label: "1. Overview & Identity" },
  { id: "google-data", label: "2. Google OAuth & User Data" },
  { id: "limited-use", label: "3. Google Limited Use Disclosure" },
  { id: "media-streams", label: "4. Video & Audio Media Handling" },
  { id: "data-usage", label: "5. How We Use Data" },
  { id: "sharing", label: "6. Data Sharing & Third Parties" },
  { id: "retention-deletion", label: "7. Retention & Account Deletion" },
  { id: "revoke-access", label: "8. Revoking Permissions" },
  { id: "security", label: "9. Data Security Safeguards" },
  { id: "children", label: "10. Children's Privacy" },
  { id: "contact", label: "11. Contact Information" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Meet is committed to protecting your privacy. This policy explains what information we collect, how we use Google user data, our strict Limited Use compliance, and your data protection rights."
      lastUpdated="October 2026"
      tocItems={TOC_ITEMS}
    >
      {/* Quick Summary Highlights Banner */}
      <div className="bg-[#2d2e30] border border-[#3c4043] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-medium text-base">
          <svg className="w-5 h-5 text-[#81c995]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <h3>Key Privacy Guarantees at a Glance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Zero Data Selling</span>
            <p className="text-[#9aa0a6]">
              We do NOT sell, lease, rent, or trade your personal information or Google user data to any advertisers, brokers, or third parties.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Google Limited Use Adherence</span>
            <p className="text-[#9aa0a6]">
              Google user data is used solely to authenticate your account, display your identity in meetings, and schedule calendar events upon request.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Encrypted Media Streams</span>
            <p className="text-[#9aa0a6]">
              Audio, video, and screen sharing streams are encrypted in transit via WebRTC DTLS-SRTP and are never monitored or analyzed.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">User Control & Right to Delete</span>
            <p className="text-[#9aa0a6]">
              You can request instant data deletion by contacting us, or revoke Google OAuth permissions at any time via your Google Account.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Overview & Identity */}
      <section id="overview" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>1. Overview & Application Identity</span>
        </h2>
        <p>
          Welcome to <strong className="text-white">Meet</strong> (&ldquo;Meet&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a browser-based, high-definition real-time video conferencing application designed for frictionless online collaboration, instant virtual meetings, audio calling, and screen sharing.
        </p>
        <p>
          This Privacy Policy governs the collection, processing, storage, and protection of information when you access or use Meet at this website, connect through Google Cloud OAuth 2.0 authentication, or participate in video meetings.
        </p>
        <p>
          The application and service are operated and maintained by <strong className="text-white">Abdurahiman</strong> (&ldquo;Data Controller&rdquo;). If you have any questions, you can contact us at{" "}
          <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline font-mono">
            abdurahimanoffc@gmail.com
          </a>{" "}
          or by phone at{" "}
          <a href="tel:+919544499352" className="text-[#8ab4f8] hover:underline font-mono">
            +91 9544499352
          </a>.
        </p>
      </section>

      {/* 2. Google OAuth & User Data */}
      <section id="google-data" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          2. Google OAuth 2.0 & Google User Data Collection
        </h2>
        <p>
          Meet provides a seamless, secure sign-in experience using Google Cloud Identity / Google OAuth 2.0. When you click &ldquo;Sign in with Google&rdquo;, you are redirected to Google&rsquo;s secure consent screen. Meet requests access to specific, minimal scopes necessary to operate the video meeting platform:
        </p>

        <div className="space-y-3 mt-3">
          <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8ab4f8] font-bold">openid</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#3c4043] text-[#e8eaed]">Required</span>
            </div>
            <p className="text-xs text-[#bdc1c6]">
              <strong className="text-white">Purpose:</strong> Verifies your user identity using the industry-standard OpenID Connect protocol to securely log you into Meet without storing passwords.
            </p>
          </div>

          <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8ab4f8] font-bold">email &bull; https://www.googleapis.com/auth/userinfo.email</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#3c4043] text-[#e8eaed]">Required</span>
            </div>
            <p className="text-xs text-[#bdc1c6]">
              <strong className="text-white">Purpose:</strong> Accesses your primary Google account email address. We use this to establish your user account, verify meeting host privileges, link your scheduled meetings, and enable you to re-access your meetings across sessions.
            </p>
          </div>

          <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8ab4f8] font-bold">profile &bull; https://www.googleapis.com/auth/userinfo.profile</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#3c4043] text-[#e8eaed]">Required</span>
            </div>
            <p className="text-xs text-[#bdc1c6]">
              <strong className="text-white">Purpose:</strong> Accesses your Google display name and profile picture URL. This allows other participants in your video conference rooms to visually recognize you by your real name and avatar badge during live calls.
            </p>
          </div>

          <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#8ab4f8] font-bold">https://www.googleapis.com/auth/calendar.events</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#3c4043] text-[#e8eaed]">Optional / Feature-Specific</span>
            </div>
            <p className="text-xs text-[#bdc1c6]">
              <strong className="text-white">Purpose:</strong> Enables the &ldquo;Schedule in Google Calendar&rdquo; feature. When you explicitly create a scheduled meeting and choose to add it to your calendar, Meet uses this scope solely to insert the meeting entry with its title, scheduled date/time, and joining URL directly into your Google Calendar. Meet does not read, modify, or delete your existing private calendar events.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Google Limited Use Disclosure */}
      <section id="limited-use" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          3. Google API Services User Data Policy (Limited Use Disclosure)
        </h2>
        <div className="p-5 bg-[#1a73e8]/10 border-2 border-[#1a73e8]/40 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-[#8ab4f8] font-semibold text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>Mandatory Google API Compliance Statement</span>
          </div>
          <p className="text-white font-medium text-sm leading-relaxed italic bg-[#202124]/80 p-4 rounded-xl border border-[#3c4043]">
            &ldquo;Meet&rsquo;s use and transfer of information received from Google APIs to any other app will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] underline hover:text-[#aecbfa]"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.&rdquo;
          </p>
          <div className="space-y-2 text-xs text-[#bdc1c6]">
            <p className="font-semibold text-white">In strict compliance with these requirements, Meet affirms that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-white">No Advertising:</strong> We will never use or transfer Google user data for serving advertisements, including personalized, retargeted, or interest-based advertising.
              </li>
              <li>
                <strong className="text-white">No Unrelated Transfers:</strong> We do not transfer Google user data to third parties unless strictly necessary to provide or improve user-facing features (e.g. cloud hosting to route calls), to comply with applicable law, or as part of a formal merger/acquisition with clear notice.
              </li>
              <li>
                <strong className="text-white">No Human Reading:</strong> No human will read your Google user data unless: (1) we obtain your affirmative, explicit consent for specific technical troubleshooting; (2) it is necessary for security purposes (such as investigating abuse or vulnerabilities); (3) it is required by law; or (4) the data is aggregated and anonymized for internal system metrics.
              </li>
              <li>
                <strong className="text-white">No AI/ML Model Training:</strong> Google user data is NEVER used to train, retrain, or improve generalized artificial intelligence (AI) or machine learning (ML) models.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Video & Audio Media Handling */}
      <section id="media-streams" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          4. Real-Time Video, Audio & Screen Sharing Media Handling
        </h2>
        <p>
          Meet provides high-definition audio and video conferencing powered by WebRTC technology and LiveKit Selective Forwarding Unit (SFU) media servers.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>
            <strong className="text-white">Encryption in Transit:</strong> All audio, video, and screen sharing packets are encrypted end-to-end between your browser and the media router using industry-standard Datagram Transport Layer Security (DTLS) and Secure Real-time Transport Protocol (SRTP).
          </li>
          <li>
            <strong className="text-white">No Passive Recording:</strong> Meet does NOT automatically record, store, listen to, transcribe, or analyze your audio, video streams, or screen presentations. Media streams are routed ephemerally in real-time memory and discarded immediately upon packet delivery.
          </li>
          <li>
            <strong className="text-white">Explicit Recording Indicator:</strong> If a meeting host initiates a recording session, a clear, persistent visual and auditory indicator is broadcast to every participant in the room. No clandestine recording is permitted.
          </li>
          <li>
            <strong className="text-white">Local Hardware Processing:</strong> Camera enhancements (such as lighting correction, brightness adjustments, and background blur) run client-side on your local device GPU via WebGL and do not transmit raw unprocessed frames to external servers.
          </li>
        </ul>
      </section>

      {/* 5. How We Use Data */}
      <section id="data-usage" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          5. How We Use Your Information
        </h2>
        <p>We process the minimal data collected strictly for the following purposes:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-white font-medium">Session Authentication</span>
            <p className="text-[#9aa0a6]">Validating your identity, issuing secure JSON Web Tokens (JWT), and maintaining active login state.</p>
          </div>
          <div className="p-3.5 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-white font-medium">Participant Identification</span>
            <p className="text-[#9aa0a6]">Displaying your chosen name and Google avatar to fellow attendees in active video meeting rooms.</p>
          </div>
          <div className="p-3.5 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-white font-medium">Meeting Management</span>
            <p className="text-[#9aa0a6]">Creating unique meeting IDs, tracking host permissions, managing mute/kick moderation, and calendar scheduling.</p>
          </div>
          <div className="p-3.5 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-white font-medium">System Health & Diagnostics</span>
            <p className="text-[#9aa0a6]">Monitoring WebRTC packet loss, jitter, connection bitrate, and server stability to ensure call quality.</p>
          </div>
        </div>
      </section>

      {/* 6. Data Sharing & Third Parties */}
      <section id="sharing" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          6. Information Sharing & Third-Party Service Providers
        </h2>
        <p>
          <strong className="text-white">We do not sell, rent, or trade your personal information or Google user data.</strong> We only disclose necessary information to trusted third-party service providers who assist us in operating our platform, strictly bound by confidentiality and data processing agreements:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>
            <strong className="text-white">Google Cloud Platform:</strong> For OAuth 2.0 authentication and authorization services.
          </li>
          <li>
            <strong className="text-white">LiveKit SFU:</strong> Open-source real-time WebRTC media routing infrastructure responsible for streaming encrypted video and audio packets between meeting peers.
          </li>
          <li>
            <strong className="text-white">Hosting & Database Infrastructure:</strong> Secure cloud servers that host the backend API and store encrypted user profile records and meeting metadata.
          </li>
          <li>
            <strong className="text-white">Legal Obligations:</strong> We may disclose information if required to do so by law, valid court order, or governmental regulation, or to protect the safety, security, and rights of our users and the public.
          </li>
        </ul>
      </section>

      {/* 7. Retention & Account Deletion */}
      <section id="retention-deletion" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          7. Data Retention & User Deletion Rights
        </h2>
        <p>
          We retain your user account information (name, email, avatar URL) and meeting metadata only for as long as your account remains active or as needed to provide you with the service.
        </p>
        <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-3 text-xs">
          <h3 className="text-white font-semibold text-sm">How to Request Permanent Data Deletion</h3>
          <p className="text-[#bdc1c6]">
            You have the absolute right to request the complete deletion of your account, meeting history, and all associated personal records at any time.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <a
              href="mailto:abdurahimanoffc@gmail.com?subject=Account%20and%20Data%20Deletion%20Request"
              className="px-4 py-2 rounded-xl bg-[#ea4335] hover:bg-[#d93025] text-white font-medium transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              <span>Email Data Deletion Request</span>
            </a>
            <span className="text-[#9aa0a6]">
              Or email directly: <span className="font-mono text-white">abdurahimanoffc@gmail.com</span>
            </span>
          </div>
          <p className="text-[#9aa0a6] text-[11px]">
            Upon receiving your request from your registered Google email address, your personal profile, meetings, and tokens will be permanently purged from our database within forty-eight (48) hours.
          </p>
        </div>
      </section>

      {/* 8. Revoking Permissions */}
      <section id="revoke-access" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          8. Revoking Google OAuth Permissions at Any Time
        </h2>
        <p>
          You remain in full control of your Google Account permissions. You may revoke Meet&rsquo;s access to your Google account at any moment through Google&rsquo;s official security dashboard:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
          <li>
            Visit your Google Account security permissions page at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] underline hover:text-[#aecbfa]"
            >
              https://myaccount.google.com/permissions
            </a>.
          </li>
          <li>Locate <strong className="text-white">&ldquo;Meet&rdquo;</strong> in the list of third-party apps with account access.</li>
          <li>Click on Meet and select <strong className="text-white">&ldquo;Remove Access&rdquo;</strong>.</li>
        </ol>
        <p className="text-xs text-[#9aa0a6]">
          Once revoked, Meet will immediately lose access to your Google account and OAuth tokens, preventing future automatic sign-ins until you explicitly grant consent again.
        </p>
      </section>

      {/* 9. Data Security */}
      <section id="security" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          9. Data Security Safeguards
        </h2>
        <p>
          We implement rigorous administrative, technical, and physical security measures to protect your personal information against unauthorized access, loss, or alteration:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-[#81c995] font-semibold block">TLS 1.3 Encryption</span>
            <p className="text-[#9aa0a6]">All web traffic and API communications are encrypted via HTTPS using modern TLS cryptographic cipher suites.</p>
          </div>
          <div className="p-3 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-[#81c995] font-semibold block">Cryptographic Tokens</span>
            <p className="text-[#9aa0a6]">Sessions use cryptographically signed JSON Web Tokens (JWT) with strict time-to-live expiration.</p>
          </div>
          <div className="p-3 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-1">
            <span className="text-[#81c995] font-semibold block">CSRF & State Guard</span>
            <p className="text-[#9aa0a6]">Google OAuth handshakes enforce cryptographically verified anti-forgery state tokens.</p>
          </div>
        </div>
      </section>

      {/* 10. Children's Privacy */}
      <section id="children" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          10. Children&rsquo;s Privacy
        </h2>
        <p>
          Meet is not intended for use by children under the age of 13 (or under 16 in the European Economic Area) without verified parental or educational institution consent. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information without required consent, please contact us immediately, and we will promptly delete the data.
        </p>
      </section>

      {/* 11. Contact Information */}
      <section id="contact" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          11. Contact Information & Data Protection Inquiries
        </h2>
        <p>
          If you have questions, concerns, complaints, or requests regarding this Privacy Policy or our compliance with Google Cloud OAuth 2.0 User Data requirements, please contact our designated representative directly:
        </p>

        <div className="p-6 bg-[#2d2e30] border border-[#3c4043] rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Data Controller / Developer</span>
              <span className="text-white font-medium text-sm">Abdurahiman</span>
            </div>
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Application Name</span>
              <span className="text-white font-medium text-sm">Meet (Video Platform)</span>
            </div>
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Official Contact Email</span>
              <a
                href="mailto:abdurahimanoffc@gmail.com"
                className="text-[#8ab4f8] hover:underline font-mono text-sm break-all"
              >
                abdurahimanoffc@gmail.com
              </a>
            </div>
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Official Contact Phone</span>
              <a
                href="tel:+919544499352"
                className="text-[#8ab4f8] hover:underline font-mono text-sm"
              >
                +91 9544499352 / 9544499352
              </a>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Jurisdiction</span>
              <span className="text-white font-medium text-xs">Kerala, India</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#3c4043] flex flex-wrap gap-3">
            <a
              href="mailto:abdurahimanoffc@gmail.com"
              className="px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <span>Email: abdurahimanoffc@gmail.com</span>
            </a>
            <a
              href="tel:+919544499352"
              className="px-5 py-2.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d52] text-white text-xs font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              <span>Phone: 9544499352</span>
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}

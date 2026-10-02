import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — Meet",
  description:
    "Terms of Service and Conditions of Use for Meet video conferencing application.",
};

const TOC_ITEMS = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "service-desc", label: "2. Description of Service" },
  { id: "eligibility", label: "3. Eligibility & Account Security" },
  { id: "google-auth", label: "4. Google Account & Permissions" },
  { id: "acceptable-use", label: "5. Acceptable Use Policy" },
  { id: "user-content", label: "6. User Content & Ownership" },
  { id: "recordings", label: "7. Meetings & Recordings" },
  { id: "intellectual-prop", label: "8. Intellectual Property" },
  { id: "disclaimers", label: "9. Disclaimers & Warranties" },
  { id: "liability", label: "10. Limitation of Liability" },
  { id: "termination", label: "11. Termination & Suspension" },
  { id: "governing-law", label: "12. Governing Law" },
  { id: "changes", label: "13. Modifications to Terms" },
  { id: "contact", label: "14. Contact Information" },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these Terms of Service carefully before using Meet. By accessing or using our video conferencing platform, you agree to be bound by these terms."
      lastUpdated="October 2026"
      tocItems={TOC_ITEMS}
    >
      {/* Quick Summary Highlights Banner */}
      <div className="bg-[#2d2e30] border border-[#3c4043] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-white font-medium text-base">
          <svg className="w-5 h-5 text-[#8ab4f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.09 1.976 1.052 1.976 2.187V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
          <h3>Summary of Terms</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Browser-First Collaboration</span>
            <p className="text-[#9aa0a6]">
              Instant HD video meetings without required software installation. Sign in securely with your Google Account.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">You Own Your Content</span>
            <p className="text-[#9aa0a6]">
              You retain 100% of all intellectual property rights to the speech, video, presentations, and files you share.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Safe & Respectful Use</span>
            <p className="text-[#9aa0a6]">
              Harassment, copyright infringement, clandestine recording, and illegal activities are strictly forbidden.
            </p>
          </div>
          <div className="p-3.5 bg-[#202124] rounded-xl border border-[#3c4043]/60 space-y-1">
            <span className="text-[#8ab4f8] font-semibold block">Direct Support</span>
            <p className="text-[#9aa0a6]">
              Operated by Abdurahiman with direct email and telephone support for any inquiries or disputes.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Acceptance of Terms */}
      <section id="acceptance" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          1. Acceptance of Terms
        </h2>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and <strong className="text-white">Abdurahiman</strong> (&ldquo;Developer&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of the <strong className="text-white">Meet</strong> video conferencing application, services, and associated web interfaces.
        </p>
        <p>
          By accessing the application, clicking &ldquo;Sign in with Google&rdquo;, generating a meeting link, or participating in a meeting, you acknowledge that you have read, understood, and agree to be bound by these Terms and our{" "}
          <Link href="/privacy" className="text-[#8ab4f8] underline hover:text-[#aecbfa]">
            Privacy Policy
          </Link>
          . If you do not agree to these Terms, you must not access or use the service.
        </p>
      </section>

      {/* 2. Description of Service */}
      <section id="service-desc" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          2. Description of the Service
        </h2>
        <p>
          Meet is a modern, web-native real-time video conferencing application built with WebRTC and LiveKit selective forwarding technology. The platform enables users to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>Create instant online meeting rooms with unique, shareable meeting codes and links.</li>
          <li>Transmit and receive real-time high-definition video and high-fidelity audio streams.</li>
          <li>Share screen displays, browser tabs, and application windows in real time.</li>
          <li>Utilize client-side GPU video enhancement (e.g. lighting adjustment, contrast tuning, and sharpen filters) via WebGL.</li>
          <li>Schedule virtual meetings directly to Google Calendar using Google Cloud OAuth integration.</li>
        </ul>
      </section>

      {/* 3. Eligibility & Account Security */}
      <section id="eligibility" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          3. Eligibility & Account Security
        </h2>
        <p>
          You must be at least thirteen (13) years of age (or sixteen (16) years of age where required by local law in jurisdictions such as the European Economic Area) to use this service. By using Meet, you represent and warrant that you meet this age requirement.
        </p>
        <p>
          You are responsible for maintaining the confidentiality and security of the Google Account credentials used to access Meet. You agree to notify us immediately at{" "}
          <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline font-mono">
            abdurahimanoffc@gmail.com
          </a>{" "}
          if you discover or suspect any unauthorized access to your account or any other breach of security.
        </p>
      </section>

      {/* 4. Google Account & Permissions */}
      <section id="google-auth" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          4. Google Account & Cloud OAuth Integration
        </h2>
        <p>
          Meet utilizes Google Cloud OAuth 2.0 to authenticate your identity. By signing in with Google, you authorize Meet to access your basic public profile information, verified email address, and (if you choose to use the calendar scheduling feature) permission to create events in your Google Calendar.
        </p>
        <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2 text-xs">
          <p className="text-white font-medium">Compliance with Google API Services User Data Policy</p>
          <p className="text-[#bdc1c6]">
            Meet strictly adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] underline hover:text-[#aecbfa]"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. Your Google user data will never be sold, used for advertising, or used to train artificial intelligence models.
          </p>
          <p className="text-[#9aa0a6]">
            You can revoke Meet&rsquo;s OAuth access at any time via{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] underline"
            >
              Google Account Permissions
            </a>.
          </p>
        </div>
      </section>

      {/* 5. Acceptable Use Policy */}
      <section id="acceptable-use" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          5. Acceptable Use Policy & Community Standards
        </h2>
        <p>
          You agree to use Meet in compliance with all applicable local, state, national, and international laws and regulations. You specifically agree <strong className="text-white">NOT</strong> to:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
          <li>Transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or racially, ethnically, or otherwise objectionable.</li>
          <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.</li>
          <li>Transmit any unsolicited or unauthorized advertising, promotional materials, &ldquo;junk mail&rdquo;, &ldquo;spam&rdquo;, or &ldquo;chain letters&rdquo;.</li>
          <li>Transmit software viruses, worms, malware, or any other computer code designed to interrupt, destroy, or limit the functionality of any computer hardware or telecommunications equipment.</li>
          <li>Interfere with, disrupt, or place an unreasonable burden on Meet servers, network bandwidth, or LiveKit media gateways.</li>
          <li>Attempt to gain unauthorized access to any meeting room, host control, user account, or server system through hacking, password mining, or any other means.</li>
        </ul>
      </section>

      {/* 6. User Content & Ownership */}
      <section id="user-content" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          6. User Content & Intellectual Property Ownership
        </h2>
        <p>
          <strong className="text-white">You retain complete ownership:</strong> You retain all intellectual property rights, copyright, and ownership in and to any speech, video broadcasts, chat messages, screen share visuals, or files (&ldquo;User Content&rdquo;) that you transmit through Meet.
        </p>
        <p>
          Meet does not claim any ownership rights over your User Content. By using the service, you grant Meet only the limited, temporary, non-exclusive technical license to transmit, encode, route, and deliver your audio, video, and screen streams to designated meeting participants via WebRTC infrastructure.
        </p>
      </section>

      {/* 7. Meetings & Recordings */}
      <section id="recordings" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          7. Virtual Meetings & Recording Regulations
        </h2>
        <p>
          You are solely responsible for compliance with all wiretapping, recording, and privacy laws in your jurisdiction regarding audio and video recording.
        </p>
        <div className="p-4 bg-[#2d2e30] border border-[#3c4043] rounded-xl space-y-2 text-xs">
          <p className="text-white font-medium">Notice & Consent Requirement</p>
          <p className="text-[#bdc1c6]">
            Many jurisdictions require the consent of all parties on a call before recording. If you record, photograph, or capture any meeting participant, you represent and warrant that you have obtained all necessary prior consents from all participants in the meeting room. Meet disclaims all liability resulting from your failure to obtain required consents.
          </p>
        </div>
      </section>

      {/* 8. Intellectual Property */}
      <section id="intellectual-prop" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          8. Proprietary Rights & Trademarks
        </h2>
        <p>
          The Meet software, website design, UI layout, logos, custom graphics, source code, and video enhancement algorithms are owned by Abdurahiman and protected by intellectual property and unfair competition laws.
        </p>
        <p className="text-xs text-[#9aa0a6]">
          Google, Google Meet, and the Google logo are trademarks of Google LLC. This platform is an independent project integrating Google OAuth 2.0 and Google Calendar APIs in accordance with Google&rsquo;s developer terms and is not officially affiliated with or endorsed by Google LLC.
        </p>
      </section>

      {/* 9. Disclaimers & Warranties */}
      <section id="disclaimers" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          9. Service Availability & Disclaimers (&ldquo;AS IS&rdquo;)
        </h2>
        <div className="p-5 bg-[#2d2e30] border border-[#3c4043] rounded-2xl space-y-3 text-xs leading-relaxed">
          <p className="uppercase font-bold text-white tracking-wider text-[11px]">Warranty Disclaimer</p>
          <p className="text-[#bdc1c6]">
            THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT EXPRESS OR IMPLIED WARRANTIES OF ANY KIND, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="text-[#bdc1c6]">
            WE DO NOT WARRANT THAT: (A) THE SERVICE WILL MEET YOUR SPECIFIC REQUIREMENTS; (B) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; OR (C) DEFECTS OR NETWORK JITTER WILL BE CORRECTED IMMEDIATELY. REAL-TIME AUDIO AND VIDEO STREAMING RELIES ON YOUR LOCAL NETWORK, INTERNET SERVICE PROVIDER, HARDWARE PERFORMANCE, AND WEBRTC PEER CONNECTIVITY.
          </p>
        </div>
      </section>

      {/* 10. Limitation of Liability */}
      <section id="liability" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          10. Limitation of Liability
        </h2>
        <div className="p-5 bg-[#2d2e30] border border-[#3c4043] rounded-2xl space-y-3 text-xs leading-relaxed">
          <p className="uppercase font-bold text-white tracking-wider text-[11px]">Limitation of Damages</p>
          <p className="text-[#bdc1c6]">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ABDURAHIMAN, ITS AFFILIATES, AGENTS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
          </p>
        </div>
      </section>

      {/* 11. Termination & Suspension */}
      <section id="termination" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          11. Account Termination & Suspension
        </h2>
        <p>
          We reserve the right to suspend or terminate your access to the service at any time, with or without notice, if you breach any provision of these Terms or engage in conduct that harms the platform, other users, or third parties.
        </p>
        <p>
          You may terminate your agreement with us at any time by ceasing all use of the application and sending an email requesting deletion of your account to{" "}
          <a href="mailto:abdurahimanoffc@gmail.com" className="text-[#8ab4f8] hover:underline font-mono">
            abdurahimanoffc@gmail.com
          </a>.
        </p>
      </section>

      {/* 12. Governing Law */}
      <section id="governing-law" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          12. Governing Law & Dispute Resolution
        </h2>
        <p>
          These Terms and any dispute arising out of or related to your use of Meet shall be governed by and construed in accordance with the laws of India, specifically within the jurisdiction of the state of Kerala, without giving effect to any principles of conflicts of law.
        </p>
      </section>

      {/* 13. Modifications to Terms */}
      <section id="changes" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          13. Modifications to these Terms
        </h2>
        <p>
          We may update or modify these Terms from time to time. When changes are made, we will update the &ldquo;Last Updated&rdquo; date at the top of this page. Your continued use of Meet following any modifications constitutes your acceptance of the revised Terms.
        </p>
      </section>

      {/* 14. Contact Information */}
      <section id="contact" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          14. Contact Information
        </h2>
        <p>
          For any legal inquiries, concerns, reports of violation, or questions regarding these Terms, please reach out to:
        </p>

        <div className="p-6 bg-[#2d2e30] border border-[#3c4043] rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Authorized Representative</span>
              <span className="text-white font-medium text-sm">Abdurahiman</span>
            </div>
            <div>
              <span className="text-[#9aa0a6] block uppercase tracking-wider text-[10px] font-semibold">Service Name</span>
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
              href="mailto:abdurahimanoffc@gmail.com?subject=Terms%20of%20Service%20Inquiry"
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

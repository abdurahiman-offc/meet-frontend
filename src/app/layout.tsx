import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meet — Online Video Meetings",
  description: "Browser-first video meeting platform. Create or join meetings instantly, with HD video, audio, and screen sharing.",
  keywords: ["video meetings", "online meetings", "video conferencing", "WebRTC"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0d1117" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[hsl(220,20%,8%)] text-[hsl(210,20%,95%)] antialiased">
        {children}
      </body>
    </html>
  );
}

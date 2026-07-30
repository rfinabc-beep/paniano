import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "পথ কুরিয়ার — দ্রুত ও নির্ভরযোগ্য পার্সেল ডেলিভারি",
  description: "সারা দেশে পার্সেল বুকিং, পিকআপ ও রিয়েল-টাইম ট্র্যাকিং।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" style={{ fontFamily: "'Noto Sans Bengali', var(--font-body)" }}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";

import "@/app/globals.css";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { AppToaster } from "@/components/providers/toaster";

export const metadata: Metadata = {
  title: "Northants Challenge",
  description: "Take Northamptonshire's slick weekly local-knowledge challenge.",
  openGraph: {
    title: "Northants Challenge",
    description: "Take this week's fast-paced challenge, climb the leaderboard, and prove you're a local legend.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="min-h-[calc(100vh-160px)]">{children}</div>
        <SiteFooter />
        <AppToaster />
      </body>
    </html>
  );
}

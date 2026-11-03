import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAVÉRA — Considered living, beautifully made",
  description: "Discover thoughtfully selected furniture and home pieces from MAVÉRA. Shop online or enquire about visiting our store in Kenya.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

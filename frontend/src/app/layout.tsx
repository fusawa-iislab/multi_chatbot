import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "persona",
  description: "persona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="text-[10px] md:text-[14px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px]"
    >
      <body>{children}</body>
    </html>
  );
}

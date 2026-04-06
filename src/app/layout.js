import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";

const notoSans = Noto_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSansMono = Noto_Sans_Mono({
  variable: "--font-google-sans-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Expense Atlas",
  description: "Trip expense planner application",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${notoSans.variable} ${notoSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

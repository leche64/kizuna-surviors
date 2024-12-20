import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/Navbar";
import AnimateBackground from "./components/AnimateBackground";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
const vt323 = localFont({
  src: "./fonts/VT323-Regular.ttf",
  variable: "--font-vt323",
  weight: "400",
});

export const metadata = {
  title: "Shapecraft Survivors",
  description: "A survival game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js"></script>
      </head>
      <body className={`${vt323.variable} antialiased`}>
        <Providers>
          {" "}
          <AnimateBackground />
          <Navbar />
          {children}
          <Analytics />
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

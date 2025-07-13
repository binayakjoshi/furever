import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavigationBar from "@/components/navigation/navigation-bar";
import { AuthProvider } from "@/context/auth-context";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import ChatWidgetWrapper from "@/components/custom-elements/ChatWidgetWrapper";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Furever",
  description: "Pet Care Web Application",
};
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider initialUser={null}>
            <NavigationBar />
            {children}
            <ChatWidgetWrapper />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
};
export default RootLayout;

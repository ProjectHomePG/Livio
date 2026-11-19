import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import MobileBottomNav from "../components/Layout/MobileBottomNav";
import { ThemeProvider } from "../context/ThemeContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8082";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Livio - PG Near Me | Verified PG, Rooms & Co-Living",
    template: "%s | Livio - PG Near Me",
  },
  description:
    "Livio (PG Near Me) - Find verified paying guest for boys & girls, student PG, coliving PG, hostel and rooms near tech parks, colleges, metro stations and corporate hubs across India.",
  keywords: [
    "PG Near Me",
    "PG near",
    "PG for boys",
    "PG for girls",
    "colive PG",
    "coliving PG",
    "hostel",
    "paying guest",
    "student PG",
    "PG in",
    "paying guest for boys",
    "paying guest for girls",
    "boys and girls hostel",
    "Livio",
  ],
  authors: [{ name: "Livio" }],
  openGraph: {
    title: "Livio - PG Near Me | Verified PG, Rooms & Co-Living",
    description:
      "Find a PG near me - verified paying guest for boys & girls, student PG, coliving PG and hostel stays near colleges and tech parks.",
    url: siteUrl,
    siteName: "Livio - PG Near Me",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livio - PG Near Me | Verified PG, Rooms & Co-Living",
    description:
      "Find a PG near me - verified paying guest for boys & girls, student PG, coliving PG and hostel stays near colleges and tech parks.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtm.js?id=GTM-NN266WM4"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('livio-theme');var isDark=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);var root=document.documentElement;if(isDark){root.classList.add('dark');root.classList.remove('light');root.setAttribute('data-theme','dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.classList.add('light');root.setAttribute('data-theme','light');root.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary-500 selection:text-white">
        <ThemeProvider>
          <PreferencesProvider>
            <Navbar />
            <main className="flex-grow w-full">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </PreferencesProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

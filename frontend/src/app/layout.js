import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";
import MobileBottomNav from "../components/Layout/MobileBottomNav";
import { ThemeProvider } from "../context/ThemeContext";
import { PreferencesProvider } from "../context/PreferencesContext";

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
  description: "Livio (PG Near Me) - Discover premium, verified Paying Guest accommodations and co-living stays near tech parks, colleges, metro stations, and corporate hubs across India.",
  keywords: ["Livio", "PG Near Me", "Paying Guest", "Co-living", "Hostel", "Student Accommodation", "Rooms for rent"],
  authors: [{ name: "Livio" }],
  openGraph: {
    title: "Livio - PG Near Me | Verified PG, Rooms & Co-Living",
    description: "Livio - Discover verified paying guest (PG) rooms and co-living spaces near you.",
    url: siteUrl,
    siteName: "Livio - PG Near Me",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livio - PG Near Me | Verified PG, Rooms & Co-Living",
    description: "Livio - Discover verified paying guest (PG) rooms and co-living spaces near you.",
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
      </body>
    </html>
  );
}

import { useState, ReactNode, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // جلوگیری از اسکرول در زمان باز بودن منو در موبایل
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen, isMobile]);

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Header همیشه بالاتر از همه */}
      <div className="fixed top-0 right-0 left-0 z-50">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      </div>

      {/* Sidebar (زیر Header در z-index پایین‌تر) */}
      <Sidebar
        isOpen={!isMobile || isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 
          ${!isMobile ? "mr-64" : "mr-0"} 
          pt-[4.5rem]  /* فاصله از زیر Header برای جلوگیری از overlap */
        `}
        onClick={() => {
          // بستن منو در موبایل با کلیک روی محتوا
          if (isMobile && isMobileMenuOpen) setIsMobileMenuOpen(false);
        }}
      >
        {children}
      </main>
    </div>
  );
}

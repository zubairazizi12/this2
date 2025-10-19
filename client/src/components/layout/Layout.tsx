import { useState, ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Sidebar */}
      <Sidebar 
        isOpen={!isMobile || isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${!isMobile ? 'mr-64' : 'mr-0'}`}>
        {children}
      </main>
    </div>
  );
}

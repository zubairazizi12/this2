import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const isMobile = useIsMobile();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-green-600 text-white px-4 md:px-6 py-3 shadow-md">
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-green-700 md:hidden focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
          aria-label="باز کردن منوی ناوبری"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Logo and Title */}
      <div className={`flex items-center gap-2 md:gap-3 ${isMobile ? 'flex-1 justify-center' : 'mx-auto'}`}>
        <img
          src="/logo.svg"
          alt="Logo"
          className="h-8 w-8 md:h-10 md:w-10"
        />
        <h1 className="text-sm md:text-xl font-bold tracking-wide truncate">
          سیستم مدیریتی ترینری شفاخانه چشم نور
        </h1>
      </div>

      {/* Spacer for mobile to center title */}
      {isMobile && <div className="w-10" />}
    </header>
  );
};

export default Header;

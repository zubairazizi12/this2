import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Users, BarChart3, LogOut, SettingsIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/header"; // 👈 این را حفظ کردیم

const navigation = [
  { name: "ترینی", href: "/residents", icon: Users },
  { name: "استادان", href: "/teachers", icon: Users },
  { name: "گزارشات", href: "/reports", icon: BarChart3 },
  { name: "تنظیمات", href: "/setting", icon: SettingsIcon },
  { name: "وظایف", href: "/jobs", icon: SettingsIcon },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* پس‌زمینه تار هنگام باز بودن سایدبار در موبایل */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => onClose?.()}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col",
          isMobile && !isOpen && "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header مخصوص موبایل */}
        {isMobile ? (
          <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white border-b border-slate-200">
            <div className="flex items-center gap-2 flex-1">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <h2 className="text-sm font-bold">سیستم مدیریتی ترینی</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="text-white hover:bg-green-700"
              aria-label="بستن منوی ناوبری"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          // ✅ Header اصلی پروژه فقط در دسکتاپ
          <div className="border-b border-slate-200">
            <Header />
          </div>
        )}

        {/* User Info */}
        <div className="px-4 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ""} alt="User profile" />
              <AvatarFallback className="bg-hospital-green-100 text-hospital-green-600">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="mr-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName || user?.email || "User"}
              </p>
              <p className="text-xs text-slate-500 capitalize truncate">
                {user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              location === item.href || location.startsWith(item.href + "/");

            if (item.href === "/setting" && user?.role !== "admin") return null;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-hospital-green-50 text-hospital-green-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="ml-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        <div className="px-4 py-4 border-t border-slate-200 bg-white">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="ml-3 h-5 w-5" />
            خروج
          </Button>
        </div>
      </div>
    </>
  );
}

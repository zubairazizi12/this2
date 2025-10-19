// AboutUs.tsx
import React from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGlobe, FaTwitter, FaLinkedin, FaInstagram, FaFacebook, FaLeaf } from "react-icons/fa";

export default function AboutUs() {
  const companies = [
    {
      name: "WinSoft Technology",
      description: "فناوری اطلاعات و خدمات نرم‌افزاری",
      details:
        "شرکت تکنالوژی وین سافت با بیش از ۱۰ سال تجربه در ارائه راهکارهای نرم‌افزاری و خدمات IT، پروژه‌های متعددی را با موفقیت انجام داده است.",
      website: "https://companyA.com",
      logo: "/logos/companyA.png",
      color: "bg-gradient-to-br from-emerald-50 to-green-50",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
      socialMedia: [
        { platform: "twitter", url: "https://twitter.com/companyA", icon: <FaTwitter className="text-emerald-600" /> },
        { platform: "linkedin", url: "https://linkedin.com/company/companyA", icon: <FaLinkedin className="text-emerald-700" /> },
        { platform: "instagram", url: "https://instagram.com/companyA", icon: <FaInstagram className="text-emerald-800" /> },
      ]
    },
    {
      name: "CodeA Software Development Team",
      description: "طراحی و توسعه وب و اپلیکیشن",
      details:
        "شرکت تکنالوژی وین سافت با تیم حرفه‌ای خود خدمات طراحی و توسعه وب‌سایت و اپلیکیشن‌های موبایل را ارائه می‌دهد.",
      website: "https://companyB.com",
      logo: "/logos/companyB.png",
      color: "bg-gradient-to-br from-lime-50 to-green-100",
      buttonColor: "bg-lime-600 hover:bg-lime-700 text-white",
      socialMedia: [
        { platform: "website", url: "https://companyB.com", icon: <FaGlobe className="text-lime-600" /> },
        { platform: "twitter", url: "https://twitter.com/companyB", icon: <FaTwitter className="text-lime-700" /> },
        { platform: "facebook", url: "https://facebook.com/companyB", icon: <FaFacebook className="text-lime-800" /> },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <div className="mr-0 md:mr-64 pt-16 md:pt-20 p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
            درباره ما
          </h1>
          <p className="text-slate-600 mt-2 text-xs md:text-sm max-w-2xl mx-auto">
            معرفی شرکت‌های گروه و خدمات متنوعی که ارائه می‌دهیم
          </p>
        </div>

        {/* Grid شرکت‌ها */}
        <div className="grid gap-6 md:grid-cols-2">
          {companies.map((company) => (
            <Card
              key={company.name}
              className={`hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${company.color} rounded-lg overflow-hidden border-0 shadow-md`}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-3 border-b border-emerald-100/50">
                {company.logo && (
                  <div className="relative">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-emerald-900">{company.name}</CardTitle>
                  <CardDescription className="text-emerald-700 mt-1 text-xs">
                    {company.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-700 mb-4 leading-relaxed text-justify text-sm">{company.details}</p>
                
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-emerald-600 mb-2">شبکه‌های اجتماعی</h3>
                  <div className="flex gap-2">
                    {company.socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs hover:shadow-sm transition-shadow border border-emerald-100 hover:border-emerald-200"
                        aria-label={`${social.platform} ${company.name}`}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-emerald-100/50">
                  <div className="flex gap-1">
                    <span className="text-xs py-1 px-2 rounded-full bg-emerald-100 text-emerald-700">فناوری</span>
                    <span className="text-xs py-1 px-2 rounded-full bg-emerald-100 text-emerald-700">نوآوری</span>
                  </div>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${company.buttonColor} shadow-xs hover:shadow-sm transition-shadow text-xs`}
                  >
                    <FaGlobe className="text-xs" />
                    <span>وب‌سایت</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* بخش اضافی برای اطلاعات تماس */}
        <Card className="rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border-0 shadow-md mt-8">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg font-bold text-emerald-900">با ما در ارتباط باشید</CardTitle>
            <CardDescription className="text-slate-600 text-xs">
              برای کسب اطلاعات بیشتر درباره خدمات ما، با ما تماس بگیرید
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-1">
            <div className="flex justify-center gap-4 mb-4">
              <a href="tel:+982112345678" className="flex items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors text-xs">
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  📞
                </span>
                <span>+98 21 1234 5678</span>
              </a>
              <a href="mailto:info@example.com" className="flex items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors text-xs">
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  ✉️
                </span>
                <span>info@example.com</span>
              </a>
            </div>
            <Button className="rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border-0 shadow-xs text-xs py-1.5 px-4">
              <FaLeaf className="ml-1 text-xs" />
              درخواست مشاوره
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
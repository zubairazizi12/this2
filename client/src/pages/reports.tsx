import ReportCards from "@/components/reports/report-cards";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Reports() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <div className="mr-0 md:mr-64 p-4 md:p-6">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 -m-4 md:-m-6 mb-4 md:mb-6">
        <div className="px-4 md:px-6 py-4">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">گزارشات و تحلیل‌ها</h1>
        </div>
      </header>

      <ReportCards />
      </div>
    </div>
  );
}

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import TrainerLecturesModal from "./TrainerLecturesModal";

interface Teacher {
  _id?: string;
  name: string;
  lostname: string;
  fatherName: string;
  grandfatherName: string;
  academicRank: string;
  rankAchievementDate: string;
  trainerAppointmentDate: string;
  gender: string;
  province: string;
  subject: string;
  position: string;
  hospital: string;
  dateOfBirth: string;
  idNumber: string;
  dutyStartDate: string;
  contactInfo: string;
  whatsappNumber: string;
  emailAddress: string;
  postCode: string;
  appointmentType: string;
  department: string;
  experience: number;
  status: string;
}

interface Props {
  teachers: Teacher[];
}

export default function TeacherReportTable({ teachers }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLecturesTeacher, setSelectedLecturesTeacher] = useState<{id: string, name: string} | null>(null);
  const [isLecturesModalOpen, setIsLecturesModalOpen] = useState(false);

  const filteredTeachers = teachers.filter((t) => {
    return (
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedPosition ? t.position === selectedPosition : true) &&
      (selectedDepartment ? t.department === selectedDepartment : true)
    );
  });

  const handlePrint = () => {
    const printContent = document.getElementById("teachers-report-table");
    if (printContent) {
      const newWin = window.open("", "_blank");
      newWin?.document.write(
        `<html><head><title>گزارشات استادان</title>
        <style>
          table{border-collapse:collapse;width:100%;font-size:12px;}
          th,td{border:1px solid #ddd;padding:6px;text-align:left;}
          th{background:#f3f4f6;}
        </style>
        </head><body>${printContent.innerHTML}</body></html>`
      );
      newWin?.document.close();
      newWin?.print();
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTeachers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارشات استادان");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "TeachersReport.xlsx"
    );
  };

  return (
    <div className="p-6">
      {/* Header / Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">گزارشات استادان</h2>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder=" جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Position filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">سمت</option>
            {[...new Set(teachers.map((t) => t.position))].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Department filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">دپارتمنت</option>
            {[...new Set(teachers.map((t) => t.department))].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            چاپ PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            چاپ Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        id="teachers-report-table"
        className="overflow-x-auto border rounded-lg shadow-lg"
      >
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-200 text-slate-700 text-[13px]">
            <tr>
              <th className="px-3 py-2 border">نام</th>
              <th className="px-3 py-2 border">نام خانوادگی</th>
              <th className="px-3 py-2 border">نام پدر</th>
              <th className="px-3 py-2 border">نام پدربزرگ</th>
              <th className="px-3 py-2 border">رتبه علمی</th>
              <th className="px-3 py-2 border">تاریخ دریافت رتبه</th>
              <th className="px-3 py-2 border">تاریخ انتصاب مربی</th>
              <th className="px-3 py-2 border">سمت</th>
              <th className="px-3 py-2 border">دپارتمنت</th>
              <th className="px-3 py-2 border">موضوع</th>
              <th className="px-3 py-2 border">شفاخانه</th>
              <th className="px-3 py-2 border">تاریخ تولد</th>
              <th className="px-3 py-2 border">شماره تذکره</th>
              <th className="px-3 py-2 border">تاریخ شروع وظیفه</th>
              <th className="px-3 py-2 border">شماره تماس</th>
              <th className="px-3 py-2 border">واتساپ</th>
              <th className="px-3 py-2 border">ایمیل</th>
              <th className="px-3 py-2 border">کد پستی</th>
              <th className="px-3 py-2 border">نوع انتصاب</th>
              {/* <th className="px-3 py-2">سابقه</th> */}
              <th className="px-3 py-2 border">وضعیت</th>
              <th className="px-3 py-2 border">لکچرها</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((t) => (
              <tr key={t.idNumber} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2 border">{t.lostname}</td>
                <td className="px-3 py-2 border">{t.fatherName}</td>
                <td className="px-3 py-2 border">{t.grandfatherName}</td>
                <td className="px-3 py-2 border">{t.academicRank}</td>
                <td className="px-3 py-2 border">
  {new Date(t.rankAchievementDate).toLocaleDateString("fa-IR")}
</td>

                <td className="px-3 py-2 border">
  {new Date(t.trainerAppointmentDate).toLocaleDateString("fa-IR")}
</td>
                <td className="px-3 py-2 border">{t.position}</td>
                <td className="px-3 py-2 border">{t.department}</td>
                <td className="px-3 py-2 border">{t.subject}</td>
                <td className="px-3 py-2 border">{t.hospital}</td>
                <td className="px-3 py-2 border">
  {new Date(t.dateOfBirth).toLocaleDateString("fa-IR")}
</td>
                <td className="px-3 py-2 border">{t.idNumber}</td>
                <td className="px-3 py-2 border">
  {new Date(t.dutyStartDate).toLocaleDateString("fa-IR")}
</td>
                <td className="px-3 py-2 border">{t.contactInfo}</td>
                <td className="px-3 py-2 border">{t.whatsappNumber}</td>
                <td className="px-3 py-2 border">{t.emailAddress}</td>
                <td className="px-3 py-2 border">{t.postCode}</td>
                <td className="px-3 py-2 border">{t.appointmentType}</td>
                {/* <td className="px-3 py-2">{t.experience}</td> */}
                <td className="px-3 py-2 border">
                  <span
                    className={
                      t.status === "active"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-2 border text-center">
                  {t._id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLecturesTeacher({
                          id: t._id!,
                          name: `${t.name} ${t.lostname}`
                        });
                        setIsLecturesModalOpen(true);
                      }}
                    >
                      <BookOpen className="h-4 w-4 ml-1" />
                      لکچرها
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lectures Modal */}
      {selectedLecturesTeacher && (
        <TrainerLecturesModal
          trainerId={selectedLecturesTeacher.id}
          trainerName={selectedLecturesTeacher.name}
          isOpen={isLecturesModalOpen}
          onClose={() => {
            setIsLecturesModalOpen(false);
            setSelectedLecturesTeacher(null);
          }}
        />
      )}
    </div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface ViewTeacherModalProps {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
}

export default function ViewTeacherModal({ teacher, open, onClose }: ViewTeacherModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  if (!teacher) return null;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "نامشخص";
    try {
      return new Date(date).toLocaleDateString("fa-AF");
    } catch {
      return "نامشخص";
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="fa">
        <head>
          <title>گزارش استاد</title>
          <style>
            body {
              font-family: "Tahoma", sans-serif;
              background: white;
              padding: 20px;
              color: #000;
            }
            h2 {
              text-align: center;
              margin-bottom: 15px;
              color: #222;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px 10px;
              text-align: right;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .avatar {
              display: block;
              margin: 0 auto 10px;
              border-radius: 50%;
              width: 80px;
              height: 80px;
              object-fit: cover;
              border: 2px solid #4f46e5;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${
              teacher.profileImageUrl
                ? `<img src="${teacher.profileImageUrl}" class="avatar" alt="avatar"/>`
                : ""
            }
            <h2>${teacher.name} ${teacher.lostname}</h2>
          </div>
          <table>
            <tbody>
              ${[
                ["نام", teacher.name],
                ["تخلص", teacher.lostname],
                ["نام پدر", teacher.fatherName],
                ["نام پدر کلان", teacher.grandfatherName],
                ["رتبه علمی", teacher.academicRank],
                ["تاریخ اخذ رتبه", formatDate(teacher.rankAchievementDate)],
                ["تاریخ تقرری مربی", formatDate(teacher.trainerAppointmentDate)],
                ["جنسیت", teacher.gender],
                ["ولایت", teacher.province],
                ["مضمون", teacher.subject],
                ["وظیفه / موقف", teacher.position],
                ["شفاخانه", teacher.hospital],
                ["تاریخ تولد", formatDate(teacher.dateOfBirth)],
                ["نمبر تذکره", teacher.idNumber],
                ["تاریخ شروع وظیفه", formatDate(teacher.dutyStartDate)],
                ["شماره تماس", teacher.contactInfo],
                ["نمبر واتساپ", teacher.whatsappNumber],
                ["ایمیل آدرس", teacher.emailAddress],
                ["کود پوست", teacher.postCode],
                ["نوع تقرری", teacher.appointmentType],
                [
                  "وضعیت",
                  teacher.status === "active" ? "برحال" : "منفک"
                ]
              ]
                .map(
                  ([label, value]) =>
                    `<tr><th>${label}</th><td>${value || "نامشخص"}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        ref={printRef}
        className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-300 shadow-xl bg-white dark:bg-slate-900"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-indigo-500">
              <AvatarImage src={teacher.profileImageUrl || ""} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {teacher.name} {teacher.lostname}
              </h2>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 text-sm mt-6">
          <InfoItem label="نام" value={teacher.name} />
          <InfoItem label="تخلص" value={teacher.lostname} />
          <InfoItem label="نام پدر" value={teacher.fatherName} />
          <InfoItem label="نام پدر کلان" value={teacher.grandfatherName} />
          <InfoItem label="رتبه علمی" value={teacher.academicRank} />
          <InfoItem label="تاریخ اخذ رتبه" value={formatDate(teacher.rankAchievementDate)} />
          <InfoItem label="تاریخ تقرری مربی" value={formatDate(teacher.trainerAppointmentDate)} />
          <InfoItem label="جنسیت" value={teacher.gender} />
          <InfoItem label="ولایت" value={teacher.province} />
          <InfoItem label="مضمون" value={teacher.subject} />
          <InfoItem label="وظیفه / موقف" value={teacher.position} />
          <InfoItem label="شفاخانه" value={teacher.hospital} />
          <InfoItem label="تاریخ تولد" value={formatDate(teacher.dateOfBirth)} />
          <InfoItem label="نمبر تذکره" value={teacher.idNumber} />
          <InfoItem label="تاریخ شروع وظیفه" value={formatDate(teacher.dutyStartDate)} />
          <InfoItem label="شماره تماس" value={teacher.contactInfo} />
          <InfoItem label="نمبر واتساپ" value={teacher.whatsappNumber} />
          <InfoItem label="ایمیل آدرس" value={teacher.emailAddress} />
          <InfoItem label="کود پوست" value={teacher.postCode} />
          <InfoItem label="نوع تقرری" value={teacher.appointmentType} />
          <InfoItem
            label="وضعیت"
            value={
              <Badge
                className={
                  teacher.status === "active"
                    ? "bg-green-100 text-green-800 px-3 py-1 rounded-full"
                    : "bg-red-100 text-red-800 px-3 py-1 rounded-full"
                }
              >
                {teacher.status === "active" ? "برحال" : "منفک"}
              </Badge>
            }
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all"
          >
            پرینت / PDF
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all"
          >
            بستن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-medium text-slate-900 dark:text-slate-100">{value || "نامشخص"}</p>
    </div>
  );
}

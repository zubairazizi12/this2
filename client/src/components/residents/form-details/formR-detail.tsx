import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

type WeekData = { level: string; cases: string };
type CompetencyRow = {
  id: number;
  text: string;
  week1: WeekData;
  week2: WeekData;
  week3: WeekData;
  week4: WeekData;
  totalCases: string;
};
type FormData = {
  trainingYear: string; // 👈 اضافه شد
  from: string;
  to: string;
  dateBaseCodeNo: string;
  name: string;
  fatherName: string;
  department: string;
  pgy: string;
  rotationType: string;
  rotationName: string;
  date: string;
  headOfDeptSignature: string;
  programDirectorSignature: string;
  hospitalDirectorSignature: string;
  rows: CompetencyRow[];
};

interface RotationFormProps {
  trainerId?: string;
  selectedYear?: string;
  formId?: string;
  onClose?: () => void;
}

const RotationFormDisplay: React.FC<RotationFormProps> = ({
  trainerId,
  selectedYear,
  formId,
}) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!trainerId) return;
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ دریافت اطلاعات ترینر (TrainerProgress)
      const progressRes = await fetch(
        `http://localhost:5000/api/trainerProgress/${trainerId}`
      );
      if (!progressRes.ok) throw new Error("TrainerProgress یافت نشد");
      const progress = await progressRes.json();

      // 2️⃣ پیدا کردن سال انتخاب‌شده یا سال فعلی
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) {
        throw new Error(`سال ${targetYearLabel} در trainingHistory یافت نشد`);
      }

      // 3️⃣ گرفتن ID فرم Rotation (فرم I)
      const formId = yearData.forms?.formR;
      if (!formId) {
        throw new Error(
          `فرم Rotation برای ${targetYearLabel} هنوز ساخته نشده است`
        );
      }

      // 4️⃣ گرفتن خود فرم Rotation از API
      const res = await fetch(
        `http://localhost:5000/api/rotation-form-r/${formId}`
      );
      if (!res.ok) throw new Error("فرم Rotation یافت نشد");

      const result = await res.json();

      // 5️⃣ اگر چند فرم برگشت داده شد، اولین را بگیر (برای اطمینان)
      const rotationForm = Array.isArray(result) ? result[0] : result;

      // ✅ تنظیم داده‌ها در state
      setFormData(rotationForm);
    } catch (err: any) {
      console.error("❌ خطا در بارگذاری فرم Rotation:", err);
      setError(err?.message || "خطا در بارگذاری فرم Rotation");
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [trainerId, selectedYear]);

  const months = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const handleToggleEditing = () => setEditing(!editing);

  const handleFormFieldChange = (field: keyof FormData, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleWeekFieldChange = (
    rowId: number,
    weekIndex: number,
    field: keyof WeekData,
    value: string
  ) => {
    if (!formData) return;
    const newRows = formData.rows.map((r) =>
      r.id === rowId
        ? {
            ...r,
            [`week${weekIndex + 1}`]: {
              ...(r[`week${weekIndex + 1}` as keyof CompetencyRow] as WeekData),
              [field]: value,
            },
          }
        : r
    );
    setFormData({ ...formData, rows: newRows });
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/rotation-form-r/${trainerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error((await res.text()) || "خطا در ذخیره فرم");
      alert("✅ فرم ذخیره شد");
      setEditing(false);
    } catch (err: any) {
      alert("❌ " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!formData) return;
    const wsData = formData.rows.map((r) => ({
      ID: r.id,
      Competency: r.text,
      "Week 1 Level": r.week1.level,
      "Week 1 Cases": r.week1.cases,
      "Week 2 Level": r.week2.level,
      "Week 2 Cases": r.week2.cases,
      "Week 3 Level": r.week3.level,
      "Week 3 Cases": r.week3.cases,
      "Week 4 Level": r.week4.level,
      "Week 4 Cases": r.week4.cases,
      "Total Cases": r.totalCases,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rotation Form");
    XLSX.writeFile(wb, `Rotation_Form_${formData.name}.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;

    const htmlContent = `
      <html lang="en" dir="ltr">
        <head>
          <meta charset="UTF-8" />
          <title>Rotation Form - ${formData?.name}</title>
          <style>
            /* چاپ در یک صفحه A4 افقی */
            @page {
              size: A4 landscape;
              margin: 0.6cm;
            }
  
            body {
              font-family: 'Tahoma', 'Arial', sans-serif;
              direction: ltr;
              margin: 0;
              padding: 0;
              font-size: 10px;
              width: 297mm;  /* افقی */
              height: 210mm; /* افقی */
            }
  
            .container {
              border: 2px solid #333;
              padding: 6px;
              box-sizing: border-box;
              width: 100%;
              height: 80%;
              page-break-inside: avoid;
            }
  
            .border { border: 1px solid #333; }
            .border-2 { border-width: 2px; border-color: #333; }
            .border-b { border-bottom: 1px solid #333; }
            .border-b-2 { border-bottom: 2px solid #333; }
            .border-r-2 { border-right: 2px solid #333; }
  
            .flex { display: flex; }
            .flex-1 { flex: 1; }
            .p-1 { padding: 2px; }
            .p-2 { padding: 4px; }
            .p-3 { padding: 6px; }
  
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-sm { font-size: 11px; }
            .text-xs { font-size: 9px; }
            .w-20 { width: 70px; }
            .w-25p { width: 25%; }
  
            .bg-muted { background-color: #f8f8f8; }
  
            table {
              border-collapse: collapse;
              width: 100%;
              table-layout: fixed;
              font-size: 9px;
            }
  
            th, td {
              border: 1px solid #333;
              padding: 2px 3px;
              text-align: center;
              word-wrap: break-word;
            }
  
            td:first-child {
              text-align: left;
            }
  
            input { border: none; text-align: center; font-size: 10px; }
  
            /* جلوگیری از رفتن جدول به صفحه دوم */
            table, tr, td, th, div {
              page-break-inside: avoid;
            }
  
            @media print {
  .no-print { display: none; }
}

            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Row 1 -->
            <div class="flex border-b-2">
              <div class="w-25p border-r-2 p-2 font-bold text-sm">Rotation Form:</div>
              <div class="w-20 border-r-2 p-2"><b>From:</b> ${
                formData?.from
              }</div>
              <div class="w-20 border-r-2 p-2"><b>To:</b> ${formData?.to}</div>
              <div class="flex-1 p-2"><b>Date Base Code No:</b> ${
                formData?.dateBaseCodeNo
              }</div>
            </div>
  
            <!-- Header Row 2 -->
            <div class="flex border-b-2">
              <div class="w-20 border-r-2 p-2"><b>Name:</b> ${
                formData?.name
              }</div>
              <div class="w-20 border-r-2 p-2"><b>F/Name:</b> ${
                formData?.fatherName
              }</div>
              <div class="flex-1 p-2"><b>Department:</b> ${
                formData?.department
              }</div>
            </div>
  
            <!-- Rotation Type -->
            <div class="border-b-2 p-2 text-center font-bold">${
              formData?.rotationType
            }</div>
  
            <!-- Rotation Name -->
            <div class="flex border-b-2 bg-muted">
              <div class="w-25p border-r-2 p-2 font-bold text-sm text-center">
                Rotation Name: ${formData?.rotationName || ""}
              </div>
              <div class="flex-1"></div>
            </div>
  
            <!-- Main Table -->
            <table>
              <thead>
                <tr>
                  <th>Rotation Competencies PGY (${formData?.pgy})</th>
                  <th colspan="2">1st Week</th>
                  <th colspan="2">2nd Week</th>
                  <th colspan="2">3rd Week</th>
                  <th colspan="2">4th Week</th>
                  <th rowspan="2">Total Cases</th>
                </tr>
                <tr>
                  <th></th>
                  <th>Level</th><th>Cases</th>
                  <th>Level</th><th>Cases</th>
                  <th>Level</th><th>Cases</th>
                  <th>Level</th><th>Cases</th>
                </tr>
              </thead>
              <tbody>
                ${formData?.rows
                  .map(
                    (row) => `
                  <tr>
                    <td><b>${row.id}</b> - ${row.text}</td>
                    <td>${row.week1.level}</td><td>${row.week1.cases}</td>
                    <td>${row.week2.level}</td><td>${row.week2.cases}</td>
                    <td>${row.week3.level}</td><td>${row.week3.cases}</td>
                    <td>${row.week4.level}</td><td>${row.week4.cases}</td>
                    <td>${row.totalCases}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
  
            <!-- Date Row -->
            <div class="flex border-b-2" style="margin-top:6px;">
              <div class="w-20 border-r-2 p-2 font-bold text-sm">Date</div>
              <div class="flex-1 flex">
                ${Array.from({ length: 11 })
                  .map(
                    () =>
                      `<div class="flex-1 border-r border-foreground" style="min-height:24px;"></div>`
                  )
                  .join("")}
              </div>
            </div>
  
            <!-- Head of Department Signature -->
            <div class="flex border-b-2">
              <div class="w-40 border-r-2 p-2 font-bold text-xs">Head of Department Signature</div>
              <div class="flex-1 flex">
                ${Array.from({ length: 11 })
                  .map(
                    () =>
                      `<div class="flex-1 border-r border-foreground" style="min-height:36px;"></div>`
                  )
                  .join("")}
              </div>
            </div>
  
            <!-- Final Signatures -->
            <div class="flex">
              <div class="flex-1 border-r-2 p-3 text-left font-bold text-sm">Head of Department Signature</div>
              <div class="flex-1 border-r-2 p-3 text-left font-bold text-sm">Program Director Signature</div>
              <div class="flex-1 p-3 text-left font-bold text-sm">Hospital Director Signature</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) return <div className="p-4">در حال بارگذاری...</div>;
  if (error || !formData)
    return <div className="p-4 text-red-600">{error || "فرم موجود نیست"}</div>;

  return (
    <div className="p-4" dir="rtl">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          🖨️ چاپ
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          📊 Excel
        </button>
        <button
          onClick={handleToggleEditing}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editing ? "لغو" : "ویرایش"}
        </button>
        {editing && (
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-3 py-1 rounded"
          >
            💾 ذخیره
          </button>
        )}
      </div>
      <div className="mb-3">
        <b>سال اکادمیک (Academic Year):</b>{" "}
        {editing ? (
          <input
            type="text"
            value={formData.academicYear || ""}
            onChange={(e) =>
              handleFormFieldChange("academicYear", e.target.value)
            }
            className="border p-1 w-40 ml-2"
          />
        ) : (
          <span className="ml-2">{formData.academicYear}</span>
        )}
      </div>

      <div ref={printRef} className="bg-white border p-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          {(
            [
              { label: "From", field: "from" },
              { label: "To", field: "to" },
              { label: "Date Base Code No", field: "dateBaseCodeNo" },
              { label: "Department", field: "department" },
              { label: "Name", field: "name" },
              { label: "Father Name", field: "fatherName" },
              { label: "Rotation Type", field: "rotationType" },
              { label: "Rotation Name", field: "rotationName" },
            ] as { label: string; field: keyof FormData }[]
          ).map(({ label, field }) => (
            <div key={field}>
              <b>{label}:</b>{" "}
              {editing ? (
                <input
                  type="text"
                  value={formData[field] as string}
                  onChange={(e) => handleFormFieldChange(field, e.target.value)}
                  className="border p-1 w-full"
                />
              ) : (
                formData[field]
              )}
            </div>
          ))}
        </div>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-1">Competency</th>
              {months.map((m) => (
                <th key={m} className="border p-1">
                  {m} Level
                </th>
              ))}
              {months.map((m) => (
                <th key={m + "c"} className="border p-1">
                  {m} Cases
                </th>
              ))}
              <th className="border p-1">Total Cases</th>
            </tr>
          </thead>
          <tbody>
            {formData.rows.map((row) => (
              <tr key={row.id}>
                <td className="border p-1 text-left">
                  {row.id} - {row.text}
                </td>
                {[row.week1, row.week2, row.week3, row.week4].map((w, i) => (
                  <td key={i + "l"} className="border p-1">
                    {editing ? (
                      <input
                        type="text"
                        value={w.level}
                        onChange={(e) =>
                          handleWeekFieldChange(
                            row.id,
                            i,
                            "level",
                            e.target.value
                          )
                        }
                        className="w-full border p-1"
                      />
                    ) : (
                      w.level
                    )}
                  </td>
                ))}
                {[row.week1, row.week2, row.week3, row.week4].map((w, i) => (
                  <td key={i + "c"} className="border p-1">
                    {editing ? (
                      <input
                        type="text"
                        value={w.cases}
                        onChange={(e) =>
                          handleWeekFieldChange(
                            row.id,
                            i,
                            "cases",
                            e.target.value
                          )
                        }
                        className="w-full border p-1"
                      />
                    ) : (
                      w.cases
                    )}
                  </td>
                ))}
                <td className="border p-1">{row.totalCases}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
          {(
            [
              "headOfDeptSignature",
              "programDirectorSignature",
              "hospitalDirectorSignature",
            ] as (keyof FormData)[]
          ).map((sig) => (
            <div key={sig} className="border-t border-gray-600 pt-1">
              {editing ? (
                <input
                  type="text"
                  value={formData[sig]}
                  onChange={(e) => handleFormFieldChange(sig, e.target.value)}
                  className="w-full border p-1 text-center"
                />
              ) : (
                formData[sig]
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotationFormDisplay;

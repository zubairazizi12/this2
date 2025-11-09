import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, FileSpreadsheet, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface PersianRotationFormProps {
  trainerId?: string;
  formId?: string; // ✅ اضافه شد
  selectedYear?: string; // ✅ اضافه شد
  onClose?: () => void;
}

type RotationRow = {
  number: number;
  topic: string;
  grade: string;
  professorName: string;
  signature: string;
  notes: string;
};

type FormData = {
  joiningDate: string;
  name: string;
  parentType: string;
  parentName: string;
  department: string;
  trainingYear: string;
  rows: RotationRow[];
};

export default function PersianRotationForm({
  trainerId,
  selectedYear,
  formId,
}: PersianRotationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRotationForm = async () => {
    if (!trainerId) return;
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ دریافت TrainerProgress
      const progressRes = await fetch(
        `http://localhost:5000/api/trainerProgress/${trainerId}`
      );
      if (!progressRes.ok) throw new Error("TrainerProgress یافت نشد");
      const progress = await progressRes.json();

      // 2️⃣ پیدا کردن سال انتخاب‌شده (یا فعلی)
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );
      if (!yearData)
        throw new Error(`سال ${targetYearLabel} در trainingHistory یافت نشد`);

      // 3️⃣ گرفتن آیدی فرم Rotation
      const formId = yearData.forms?.formI;
      if (!formId)
        throw new Error(
          `فرم Rotation برای ${targetYearLabel} هنوز ساخته نشده است`
        );

      // 4️⃣ دریافت فرم از سرور
      const res = await fetch(
        `http://localhost:5000/api/rotation-form/form/${formId}`
      );
      if (!res.ok) throw new Error("فرم Rotation یافت نشد");

      const result = await res.json();

      // 5️⃣ ذخیره در State
      setFormData(result);
    } catch (err: any) {
      console.error("❌ خطا در بارگذاری فرم Rotation:", err);
      setError(err?.message || "خطا در بارگذاری فرم Rotation");
      setFormData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ اجرای خودکار
  useEffect(() => {
    fetchRotationForm();
  }, [trainerId, selectedYear]);

  if (loading) return <div className="p-4">در حال بارگذاری...</div>;
  if (!formData) return <div className="p-4 text-red-600">فرم یافت نشد</div>;

  const updateRow = (
    index: number,
    field: keyof RotationRow,
    value: string
  ) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData({ ...formData, rows: newRows });
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/rotation-form/${trainerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast({ title: "✅ موفقیت‌آمیز", description: "فرم ویرایش شد" });
        setFormData(result.data);
        setEditing(false);
      } else {
        toast({ title: "❌ خطا", description: result.message });
      }
    } catch (err) {
      toast({ title: "❌ خطا", description: "ارتباط با سرور برقرار نشد" });
    }
  };

  const handlePrint = () => {
    if (!formData) return;

    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) return;

    const html = `
    <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>فرم نمرات Rotation - ${formData.name}</title>
         <style>
        @page { size: A4 landscape; margin: 4cm; }
        body {
          font-family: "Calibri", sans-serif;
          background: white;
          color: #111;
          margin: 0;
          padding: 0;
        }
        .container {
          border: 2px solid #444;
          border-radius: 8px;
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }
        .title-section {
          text-align: center;
          margin-bottom: 10px;
        }
        .title-section h1 {
          font-size: 18px;
          margin: 0;
        }
        .title-section p {
          font-size: 13px;
          color: #555;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          font-size: 11px;
          margin-bottom: 10px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-item label {
          font-weight: bold;
          margin-bottom: 2px;
        }
        .info-item span {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 2px 4px;
          min-height: 18px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 8px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #444;
          padding: 4px;
          text-align: center;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        td input {
          border: none;
          text-align: center;
        }
        .note {
          font-style: italic;
          font-size: 11px;
          margin-top: 10px;
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        .signatures {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        .sign-box {
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
        }
        .sign-box p {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .sign-box .line {
          border-top: 1px solid #555;
          margin-top: 25px;
          font-size: 11px;
          color: #555;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="title-section">
            <h1>فرم مخصوص درج نمرات سیکل Rotation</h1>
            <p>شفاخانه چشم نور</p>
          </div>
  
          <div class="info-grid">
            <div class="info-item">
              <label>سال:</label>
              <span>${formData.joiningDate || ""}</span>
            </div>
            <div class="info-item">
              <label>اسم ترینی:</label>
              <span>${formData.name || ""}</span>
            </div>
            <div class="info-item">
              <label>ولد:</label>
              <span>${formData.parentType || ""}</span>
            </div>
            <div class="info-item">
              <label>ولدیت:</label>
              <span>${formData.parentName || ""}</span>
            </div>
            <div class="info-item">
              <label>دیپارتمنت:</label>
              <span>${formData.department || ""}</span>
            </div>
            <div class="info-item">
              <label>سال ترینینگ:</label>
              <span>${formData.trainingYear || ""}</span>
            </div>
          </div>
  
          <table>
            <thead>
              <tr>
                <th>شماره</th>
                <th>موضوع کنفرانس</th>
                <th>نمره داده شده</th>
                <th>اسم استاد</th>
                <th>امضا استاد</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${formData.rows
                .map(
                  (row) => `
                <tr>
                  <td>${row.number}</td>
                  <td style="text-align:right;">${row.topic || ""}</td>
                  <td>${row.grade || ""}</td>
                  <td style="text-align:right;">${row.professorName || ""}</td>
                  <td>${row.signature || ""}</td>
                  <td style="text-align:right;">${row.notes || ""}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
  
          <div class="note">
            <b>یادداشت:</b> از ۵٪ نمره داده می‌شود
          </div>
  
          <div class="signatures">
            <div class="sign-box">
              <p>شف دیپارتمنت</p>
              <div class="line">امضا</div>
            </div>
            <div class="sign-box">
              <p>آمر پروگرام ترینینگ</p>
              <div class="line">امضا</div>
            </div>
            <div class="sign-box">
              <p>مهر و امضا ریاست</p>
              <div class="line">امضا و مهر</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rotation");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "rotation-form.xlsx"
    );
  };

  return (
    <div
      className="p-4"
      dir="rtl"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      {/* Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setEditing(!editing)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editing ? "لغو" : "ویرایش"}
        </button>
        {editing && (
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-3 py-1 rounded"
          >
            ذخیره
          </button>
        )}
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          چاپ (Print)
        </button>
        <button
          onClick={exportExcel}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Excel
        </button>
      </div>

      {/* Form Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[
          { label: "سال", key: "joiningDate" },
          { label: "اسم ترینی", key: "name" },
          { label: "ولد", key: "parentType" },
          { label: "ولدیت", key: "parentName" },
          { label: "دیپارتمنت", key: "department" },
          { label: "سال ترینینگ", key: "trainingYear" },
        ].map((f, i) => (
          <div key={i} className="flex flex-col">
            <label className="text-sm font-medium mb-1">{f.label}</label>
            <Input
              value={(formData as any)[f.key]}
              onChange={(e) =>
                editing && setFormData({ ...formData, [f.key]: e.target.value })
              }
              disabled={!editing}
              className="text-right h-8 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">شماره</th>
            <th className="border px-2 py-1">موضوع کنفرانس</th>
            <th className="border px-2 py-1">نمره</th>
            <th className="border px-2 py-1">اسم استاد</th>
            <th className="border px-2 py-1">امضا</th>
            <th className="border px-2 py-1">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {formData.rows.map((row, i) => (
            <tr key={i}>
              <td className="border text-center p-1">{row.number}</td>
              <td className="border text-right p-1">{row.topic}</td>
              <td className="border text-center p-1">
                <Input
                  value={row.grade}
                  onChange={(e) =>
                    editing && updateRow(i, "grade", e.target.value)
                  }
                  disabled={!editing}
                />
              </td>
              <td className="border text-right p-1">
                <Input
                  value={row.professorName}
                  onChange={(e) =>
                    editing && updateRow(i, "professorName", e.target.value)
                  }
                  disabled={!editing}
                />
              </td>
              <td className="border text-center p-1 h-[60px]">
                {row.signature}
              </td>
              <td className="border text-right p-1">
                <Input
                  value={row.notes}
                  onChange={(e) =>
                    editing && updateRow(i, "notes", e.target.value)
                  }
                  disabled={!editing}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-center text-sm">
        {["شف دیپارتمنت", "آمر پروگرام ترینینگ", "مهر و امضا ریاست"].map(
          (t, i) => (
            <div key={i} className="border border-gray-400 rounded-md p-4">
              <p className="font-medium mb-6">{t}</p>
              <div className="border-t border-gray-400 pt-2">امضا</div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

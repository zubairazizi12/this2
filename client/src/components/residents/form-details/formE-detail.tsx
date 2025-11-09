// components/forms/FormEDetailsTable.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface Score {
  score: number;
  teacherName: string;
}
interface FormEDetailsProps {
  trainerId?: string;
  formId?: string; // ← اضافه شد
  selectedYear: string;
  onClose?: () => void;
}

interface FormE {
  _id: string;
  trainer: string;
  Name: string;
  parentType: string;
  trainingYear: string;
  incidentTitle: string;
  date: string;
  scores: Score[];
  averageScore: number;
}

export default function FormEDetails({
  trainerId,
  selectedYear,
  formId,
  onClose,
}: FormEDetailsProps) {
  const [data, setData] = useState<FormE | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);



   const fetchData = async () => {
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

      // 2️⃣ پیدا کردن سال انتخاب‌شده یا سال فعلی
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) throw new Error(`سال ${targetYearLabel} یافت نشد`);

      // 3️⃣ گرفتن آیدی فرم E مخصوص آن سال
      const formId = yearData.forms?.formE;
      if (!formId) throw new Error(`فرم E برای ${targetYearLabel} هنوز ساخته نشده است`);

      // 4️⃣ واکشی فرم واقعی
      const res = await fetch(`/api/evaluationFormE/${formId}`);
      if (!res.ok) throw new Error("فرم E یافت نشد");
      const result = await res.json();

      // 5️⃣ نرمال‌سازی داده‌ها در صورت نیاز
      setData({
        ...result,
        scores: result.scores || [],
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "خطا در بارگذاری فرم E");
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  // ✅ دریافت داده‌ها بر اساس formId یا trainerId
 useEffect(() => {
 

  fetchData();
}, [trainerId, selectedYear]); // ✅ وابستگی‌ها مثل فرم F


  const handleChangeMainField = (
    field: keyof FormE,
    value: string | number
  ) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleChangeScore = (
    idx: number,
    field: keyof Score,
    value: string | number
  ) => {
    if (!data) return;
    const newScores = [...data.scores];
    newScores[idx] = { ...newScores[idx], [field]: value };
    setData({ ...data, scores: newScores });
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      const res = await fetch(`/api/evaluationFormE/${data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در ذخیره تغییرات");
      const result = await res.json();
      setData(result.updated);
      setEditing(false);
      alert("✅ تغییرات با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره تغییرات");
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Form E</title>
            <style>
              body { font-family:sans-serif; direction:rtl; margin:20px; }
              .personal-info { display: flex; justify-content: space-between; margin-bottom:24px; }
              .personal-info > div { flex: 1; text-align:center; }
              table { width:100%; border-collapse:collapse; margin-top:16px; }
              th, td { border:1px solid #000; padding:8px; text-align:center; }
              th { background:#f0f0f0; }
            </style>
          </head>
          <body>
            ${printContents}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const detailsWS = XLSX.utils.json_to_sheet([
      { فیلد: "نام", مقدار: data.Name },
      { فیلد: "نام پدر", مقدار: data.parentType },
      { فیلد: "سال تریننگ", مقدار: data.trainingYear },
      { فیلد: "تاریخ", مقدار: data.date },
    ]);
    XLSX.utils.book_append_sheet(wb, detailsWS, "مشخصات");

    const scoresWS = XLSX.utils.json_to_sheet(
      Array.from({ length: 6 }).map((_, idx) => ({
        "عنوان واقعه": idx === 0 ? data.incidentTitle : "",
        "نمره داده شده": data.scores[idx]?.score ?? "",
        "نام استاد": data.scores[idx]?.teacherName ?? "",
        "امضای استاد": "",
        ملاحظات: "",
      }))
    );
    XLSX.utils.book_append_sheet(wb, scoresWS, "FormE");
    XLSX.writeFile(wb, `FormE_${data.Name}.xlsx`);
  };

  if (loading) return <div className="p-4 text-center">در حال بارگذاری...</div>;
  if (!data)
    return (
      <div className="p-4 text-center">فرمی برای این ترینر موجود نیست</div>
    );

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Form E - فرم ارزشیابی سالانه دستیار
        </h2>
        <div className="space-x-2">
          {editing ? (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              ذخیره
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                ویرایش
              </button>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                چاپ
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Excel
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              بستن
            </button>
          )}
        </div>
      </div>

      <div
        ref={printRef}
        className="overflow-auto border rounded-lg p-4 bg-white"
      >
        {/* اطلاعات شخصی در یک ردیف */}
        <div className="personal-info">
          <div>
            <label className="font-medium">نام</label>
            {editing ? (
              <input
                type="text"
                value={data.Name}
                onChange={(e) => handleChangeMainField("Name", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            ) : (
              <div>{data.Name}</div>
            )}
          </div>
          <div>
            <label className="font-medium">نام پدر</label>
            {editing ? (
              <input
                type="text"
                value={data.parentType}
                onChange={(e) =>
                  handleChangeMainField("parentType", e.target.value)
                }
                className="w-full border px-2 py-1 rounded"
              />
            ) : (
              <div>{data.parentType}</div>
            )}
          </div>
          <div>
            <label className="font-medium">سال تریننگ</label>
            {editing ? (
              <input
                type="text"
                value={data.trainingYear}
                onChange={(e) =>
                  handleChangeMainField("trainingYear", e.target.value)
                }
                className="w-full border px-2 py-1 rounded"
              />
            ) : (
              <div>{data.trainingYear}</div>
            )}
          </div>
          <div>
            <label className="font-medium">تاریخ</label>
            {editing ? (
              <input
                type="date"
                value={data.date}
                onChange={(e) => handleChangeMainField("date", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            ) : (
              <div>{data.date}</div>
            )}
          </div>
        </div>

        {/* جدول نمرات */}
        <table className="w-full border-collapse border border-gray-400 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">عنوان واقعه</th>
              <th className="border p-2">نمره داده شده</th>
              <th className="border p-2">نام استاد</th>
              <th className="border p-2">امضای استاد</th>
              <th className="border p-2">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx}>
                {idx === 0 && (
                  <td rowSpan={6} className="border p-2 align-top">
                    {data.incidentTitle}
                  </td>
                )}
                <td className="border p-2">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={data.scores[idx]?.score ?? ""}
                      onChange={(e) =>
                        handleChangeScore(idx, "score", Number(e.target.value))
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    data.scores[idx]?.score ?? ""
                  )}
                </td>
                <td className="border p-2">
                  {editing ? (
                    <input
                      type="text"
                      value={data.scores[idx]?.teacherName ?? ""}
                      onChange={(e) =>
                        handleChangeScore(idx, "teacherName", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  ) : (
                    data.scores[idx]?.teacherName ?? ""
                  )}
                </td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            ))}
            <tr>
              <td className="border p-2 font-semibold">اوسط نمرات</td>
              <td className="border p-2" colSpan={3}>
                {data.averageScore}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

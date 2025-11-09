// components/forms/FormHDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormHDetailsProps {
  trainerId?: string;
  selectedYear: string;
  formId?: string; // ✅ اضافه شد
  onClose?: () => void;
}

interface TrainingYear {
  year: string;
  totalScore: number | string;
  instructor: string;
}

interface FormH {
  _id: string;
  trainerId: string;
  trainer: string;
  Name: string;
  parentType: string;
  department: string;
  shiftDepartment: string;
  programDirector: string;
  trainingYears: TrainingYear[];
  averageScore: number;
  departmentHead?: string;
  programHead?: string;
  hospitalHead?: string;
}

export default function FormHDetails({
  trainerId,
  selectedYear,
  formId,
  onClose,
}: FormHDetailsProps) {
  const [data, setData] = useState<FormH | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const allYears = ["سال اول", "سال دوم", "سال سوم", "سال چهارم"];




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

        // 3️⃣ گرفتن آیدی فرم H مخصوص آن سال
        const formId = yearData.forms?.formH;
        if (!formId)
          throw new Error(`فرم H برای ${targetYearLabel} هنوز ساخته نشده است`);

        // 4️⃣ واکشی فرم واقعی
        const res = await fetch(`/api/evaluationFormH/${formId}`);
        if (res.status === 404) {
          setData(null);
          return;
        }
        if (!res.ok) throw new Error("فرم H یافت نشد");
        const result = await res.json();

        // 5️⃣ نرمال‌سازی داده‌ها
        setData({
          ...result,
          trainingYears: result.trainingYears || [],
        });
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "خطا در بارگذاری فرم H");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
   

    fetchData();
  }, [trainerId, selectedYear]); // ✅ وابستگی‌ها مثل فرم F

  const handleFieldChange = (field: keyof FormH, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleYearChange = (
    idx: number,
    field: keyof TrainingYear,
    value: string | number
  ) => {
    if (!data) return;
    const newYears = [...data.trainingYears];
    newYears[idx] = { ...newYears[idx], [field]: value };
    setData({ ...data, trainingYears: newYears });
  };

  const calculateAverage = () => {
    if (!data || data.trainingYears.length === 0) return 0;
    const validScores = data.trainingYears.map((y) =>
      typeof y.totalScore === "number" ? y.totalScore : 0
    );
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / validScores.length) * 100) / 100;
  };

  useEffect(() => {
    if (data && editing) {
      setData({ ...data, averageScore: calculateAverage() });
    }
  }, [data?.trainingYears, editing]);

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/evaluationFormH/${data._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("خطا در ذخیره");
      const result = await res.json();
      setData(result.updated);
      setEditing(false);
      alert("✅ تغییرات ذخیره شد");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    const detailsWS = XLSX.utils.json_to_sheet([
      { فیلد: "نام", مقدار: data.Name },
      { فیلد: "نام پدر", مقدار: data.parentType },
      { فیلد: "دیپارتمنت", مقدار: data.department },
      { فیلد: "شف دپارتمان", مقدار: data.shiftDepartment },
      { فیلد: "آمر برنامه آموزشی", مقدار: data.programDirector },
      { فیلد: "اوسط نمرات", مقدار: data.averageScore },
    ]);
    XLSX.utils.book_append_sheet(wb, detailsWS, "مشخصات");

    const yearsWS = XLSX.utils.json_to_sheet(
      data.trainingYears.map((y, idx) => ({
        "#": idx + 1,
        "سال آموزشی": y.year,
        "مجموع نمرات": y.totalScore,
        "نام استاد": y.instructor,
      }))
    );
    XLSX.utils.book_append_sheet(wb, yearsWS, "سال‌های آموزشی");

    const signWS = XLSX.utils.json_to_sheet([
      { مسئول: "رئیس دیپارتمنت", نام: data.departmentHead || "" },
      { مسئول: "آمر برنامه تریننگ", نام: data.programHead || "" },
      { مسئول: "رئیس شفاخانه", نام: data.hospitalHead || "" },
    ]);
    XLSX.utils.book_append_sheet(wb, signWS, "امضاها");

    XLSX.writeFile(wb, `FormH_${data.Name}.xlsx`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <title>فرم H - ${data?.Name}</title>
          <style>
            body { font-family: Tahoma, Arial; direction: rtl; margin: 20px; line-height:1.6; color:#000;}
            table { width:100%; border-collapse: collapse; margin-bottom:20px; }
            th, td { border:1px solid #333; padding:8px; text-align:center; }
            th { background:#f5f5f5; font-weight:bold; }
            .average-score { font-weight:bold; text-align:center; margin-bottom:20px; }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function() { window.print(); setTimeout(()=>window.close(),100); };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) return <div className="p-4 text-center">در حال بارگذاری...</div>;
  if (!data)
    return <div className="p-4 text-center text-red-500">فرمی موجود نیست</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Form H - فرم ارزیابی سالانه</h2>
        <div className="space-x-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
              >
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                لغو
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                ویرایش
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Excel
              </button>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                چاپ
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
        className="overflow-auto border rounded-lg max-h-[60vh] p-4 bg-white"
      >
        {/* مشخصات فردی */}
        <table className="min-w-full border border-slate-300 mb-6">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border">نام</td>
              <td className="px-3 py-2 border">
                {editing ? (
                  <input
                    value={data.Name}
                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                ) : (
                  data.Name
                )}
              </td>
              <td className="font-semibold px-3 py-2 border">نام پدر</td>
              <td className="px-3 py-2 border">
                {editing ? (
                  <input
                    value={data.parentType}
                    onChange={(e) =>
                      handleFieldChange("parentType", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                ) : (
                  data.parentType
                )}
              </td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border">دیپارتمنت</td>
              <td className="px-3 py-2 border">
                {editing ? (
                  <input
                    value={data.department}
                    onChange={(e) =>
                      handleFieldChange("department", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                ) : (
                  data.department
                )}
              </td>
              <td className="font-semibold px-3 py-2 border">شف دپارتمان</td>
              <td className="px-3 py-2 border">{data.shiftDepartment}</td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border">
                آمر برنامه آموزشی
              </td>
              <td className="px-3 py-2 border" colSpan={3}>
                {editing ? (
                  <input
                    value={data.programDirector}
                    onChange={(e) =>
                      handleFieldChange("programDirector", e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                ) : (
                  data.programDirector
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* جدول سال‌های آموزشی */}
        <table className="min-w-full border border-slate-300 mb-6">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">سال آموزشی</th>
              <th className="p-2 border">مجموع نمرات</th>
              <th className="p-2 border">نام استاد</th>
            </tr>
          </thead>
          <tbody>
            {data.trainingYears.map((year, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{year.year}</td>
                <td className="p-2 border text-center">
                  {editing ? (
                    <input
                      type="number"
                      value={year.totalScore}
                      onChange={(e) =>
                        handleYearChange(
                          idx,
                          "totalScore",
                          Number(e.target.value)
                        )
                      }
                      className="w-full border px-1 py-0.5 rounded text-center"
                    />
                  ) : (
                    year.totalScore
                  )}
                </td>
                <td className="p-2 border">
                  {editing ? (
                    <input
                      value={year.instructor}
                      onChange={(e) =>
                        handleYearChange(idx, "instructor", e.target.value)
                      }
                      className="w-full border px-1 py-0.5 rounded"
                    />
                  ) : (
                    year.instructor
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="average-score mb-4 text-center font-bold">
          اوسط نمرات: {data.averageScore}
        </div>

        {/* امضاها */}
        <table className="min-w-full border border-slate-300 signature-table">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border text-center">
                رئیس دیپارتمنت
              </td>
              <td className="font-semibold px-3 py-2 border text-center">
                آمر برنامه تریننگ
              </td>
              <td className="font-semibold px-3 py-2 border text-center">
                رئیس شفاخانه
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 border text-center min-h-[50px]">
                {data.departmentHead || "____________"}
              </td>
              <td className="px-3 py-2 border text-center min-h-[50px]">
                {data.programHead || "____________"}
              </td>
              <td className="px-3 py-2 border text-center min-h-[50px]">
                {data.hospitalHead || "____________"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

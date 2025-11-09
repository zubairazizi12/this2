// components/forms/FormCDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormCDetailsProps {
  trainerId?: string;
  selectedYear: string;
  formId?: string; // ✅ اضافه شد
  onClose?: () => void;
}

interface Evaluation {
  section: string;
  percentage: number;
  score: number;
  teacherName: string;
}

interface FormC {
  _id: string;
  trainer: string;
  name: string;
  lastName: string;
  parentType: string;
  idNumber: string;
  department: string;
  trainingYear: number;
  startYear: number;
  date: string;
  evaluations: Evaluation[];
  chef?: string;
  departmentHead?: string;
  hospitalHead?: string;
}

export default function FormCDetails({
  trainerId,
  formId,
  selectedYear,
  onClose,
}: FormCDetailsProps) {
  const [data, setData] = useState<FormC | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!trainerId) return;
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ گرفتن TrainerProgress
      const progressRes = await fetch(
        `http://localhost:5000/api/trainerProgress/${trainerId}`
      );
      if (!progressRes.ok) throw new Error("TrainerProgress یافت نشد");
      const progress = await progressRes.json();

      // 2️⃣ تعیین سال هدف (انتخاب‌شده یا فعلی)
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) {
        throw new Error(`سال ${targetYearLabel} در trainingHistory یافت نشد`);
      }

      // 3️⃣ گرفتن آیدی فرم C از تاریخچه‌ی آن سال
      const formId = yearData.forms?.formC;
      if (!formId) {
        throw new Error(`فرم C برای ${targetYearLabel} هنوز ساخته نشده است`);
      }

      // 4️⃣ 🚀 واکشی از API مخصوص Form C (نه مسیر عمومی checklists)
      const res = await fetch(
        `http://localhost:5000/api/monograph?trainerId=${trainerId}&formId=${formId}`
      );
      if (!res.ok) throw new Error("فرم C یافت نشد");
      const result = await res.json();

      // 5️⃣ اگر لازم باشد داده‌ها را نرمال‌سازی کن
      if (Array.isArray(result) && result.length > 0) {
        setData(result[0]);
      } else {
        setData(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "خطا در بارگذاری فرم C");
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  // ✅ useEffect اصلاح‌شده
  useEffect(() => {
    fetchData();
  }, [trainerId, selectedYear]); // 👈 وابستگی‌ها مثل فرم F

  // 🖨 چاپ
  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
      <head><meta charset="UTF-8"><title>Form C</title></head>
      <body>${printRef.current.innerHTML}</body>
      <script>window.print(); setTimeout(()=>window.close(), 300);</script>
      </html>
    `);
    printWindow.document.close();
  };

  // 📤 خروجی Excel
  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    const evalWS = XLSX.utils.json_to_sheet(data.evaluations);
    XLSX.utils.book_append_sheet(wb, evalWS, "ارزیابی‌ها");
    XLSX.writeFile(wb, `FormC_${data.name}_${data.lastName}.xlsx`);
  };

  // 💾 ذخیره تغییرات
  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/monograph/${data._id}`, {
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
      alert("❌ خطا در ذخیره فرم");
    } finally {
      setSaving(false);
    }
  };

  // تغییر فیلدهای عمومی
  const handleChangeMain = (field: keyof FormC, value: string | number) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  // تغییر ارزیابی‌ها
  const handleEvalChange = (
    index: number,
    field: keyof Evaluation,
    value: string | number
  ) => {
    if (!data) return;
    const newEvals = [...data.evaluations];
    newEvals[index] = { ...newEvals[index], [field]: value };
    setData({ ...data, evaluations: newEvals });
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600">در حال بارگذاری...</div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-red-600">
        فرم برای این ترینر موجود نیست
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Form C - ارزیابی مونوگراف</h2>
        <div className="space-x-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-3 py-1 rounded"
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
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Excel
              </button>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                ویرایش
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={printRef} className="border rounded-lg bg-white p-4">
        {/* مشخصات */}
        <table className="w-full border border-slate-300 mb-4 text-sm">
          <tbody>
            <tr>
              <td className="font-semibold border p-2">نام</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.name}
                    onChange={(e) => handleChangeMain("name", e.target.value)}
                  />
                ) : (
                  data.name
                )}
              </td>
              <td className="font-semibold border p-2">تخلص</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.lastName}
                    onChange={(e) =>
                      handleChangeMain("lastName", e.target.value)
                    }
                  />
                ) : (
                  data.lastName
                )}
              </td>
              <td className="font-semibold border p-2">نام پدر</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.parentType}
                    onChange={(e) =>
                      handleChangeMain("parentType", e.target.value)
                    }
                  />
                ) : (
                  data.parentType
                )}
              </td>
            </tr>
            <tr>
              <td className="font-semibold border p-2">شماره شناسایی</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.idNumber}
                    onChange={(e) =>
                      handleChangeMain("idNumber", e.target.value)
                    }
                  />
                ) : (
                  data.idNumber
                )}
              </td>
              <td className="font-semibold border p-2">رشته</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.department}
                    onChange={(e) =>
                      handleChangeMain("department", e.target.value)
                    }
                  />
                ) : (
                  data.department
                )}
              </td>
              <td className="font-semibold border p-2">سال آموزشی</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full"
                    value={data.trainingYear}
                    onChange={(e) =>
                      handleChangeMain("trainingYear", Number(e.target.value))
                    }
                  />
                ) : (
                  data.trainingYear
                )}
              </td>
            </tr>
            <tr>
              <td className="font-semibold border p-2">سال شروع</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full"
                    value={data.startYear}
                    onChange={(e) =>
                      handleChangeMain("startYear", Number(e.target.value))
                    }
                  />
                ) : (
                  data.startYear
                )}
              </td>
              <td className="font-semibold border p-2">تاریخ</td>
              <td className="border p-2" colSpan={3}>
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.date}
                    onChange={(e) => handleChangeMain("date", e.target.value)}
                  />
                ) : (
                  data.date
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* جدول ارزیابی‌ها */}
        <table className="w-full border border-slate-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 w-10">#</th>
              <th className="border p-2">بخش</th>
              <th className="border p-2 w-20">فیصدی</th>
              <th className="border p-2 w-20">نمره</th>
              <th className="border p-2 w-40">نام استاد</th>
            </tr>
          </thead>
          <tbody>
            {data.evaluations.map((ev, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">
                  {editing ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={ev.section}
                      onChange={(e) =>
                        handleEvalChange(idx, "section", e.target.value)
                      }
                    />
                  ) : (
                    ev.section
                  )}
                </td>
                <td className="border p-2 text-center">
                  {editing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-center"
                      value={ev.percentage}
                      onChange={(e) =>
                        handleEvalChange(
                          idx,
                          "percentage",
                          Number(e.target.value)
                        )
                      }
                    />
                  ) : (
                    ev.percentage
                  )}
                </td>
                <td className="border p-2 text-center">
                  {editing ? (
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-full text-center"
                      value={ev.score}
                      onChange={(e) =>
                        handleEvalChange(idx, "score", Number(e.target.value))
                      }
                    />
                  ) : (
                    ev.score
                  )}
                </td>
                <td className="border p-2">
                  {editing ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={ev.teacherName}
                      onChange={(e) =>
                        handleEvalChange(idx, "teacherName", e.target.value)
                      }
                    />
                  ) : (
                    ev.teacherName
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* قسمت امضاها (غیرقابل ویرایش) */}
        <table className="w-full border border-slate-300 mt-6 text-sm">
          <tbody>
            <tr>
              <td className="font-semibold border p-2 text-center">
                آمر پروگرامینک
              </td>
              <td className="border p-2 text-center">
                {data.chef || "____________"}
              </td>
              <td className="font-semibold border p-2 text-center">
                رئیس شفاخانه
              </td>
              <td className="border p-2 text-center">
                {data.departmentHead || "____________"}
              </td>
              <td className="font-semibold border p-2 text-center">
                رئیس دپارتمان
              </td>
              <td className="border p-2 text-center">
                {data.hospitalHead || "____________"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

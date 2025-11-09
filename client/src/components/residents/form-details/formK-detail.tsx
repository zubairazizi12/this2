// components/forms/FormKDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormKDetailsProps {
  trainerId?: string;
  selectedYear: string;
  formId?: string;
  onClose?: () => void;
}

interface Evaluation {
  section: string;
  percentage: number | string;
  score: number | string;
  teacherName: string;
  teacherSigned: boolean;
  characteristics?: string;
  total?: number | string;
  average?: number | string;
  notes?: string;
}

interface FormK {
  _id: string;
  trainer: string;
  name: string;
  lastName: string;
  parentType: string;
  idNumber: string;
  department: string;
  trainingYear: string;
  startYear: string;
  date: string;
  evaluations: Evaluation[];
  summary: {
    total: string;
    average: string;
    notes: string;
  };
  supervisor?: string;
  departmentHead?: string;
  programHead?: string;
}


export default function FormKDetails({
  trainerId,
  formId,
  selectedYear,
  onClose,
}: FormKDetailsProps) {
  const [data, setData] = useState<FormK | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // 📦 دریافت داده از سرور
  const fetchData = async () => {
    if (!trainerId) return;
    setLoading(true);
    setError(null);

    try {
      const progressRes = await fetch(
        `http://localhost:5000/api/trainerProgress/${trainerId}`
      );
      if (!progressRes.ok) throw new Error("TrainerProgress یافت نشد");
      const progress = await progressRes.json();

      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) throw new Error(`سال ${targetYearLabel} یافت نشد`);

      const formId = yearData.forms?.formK;
      if (!formId)
        throw new Error(`فرم K برای ${targetYearLabel} هنوز ساخته نشده است`);

      const res = await fetch(`/api/monographEvaluation/${formId}`);
      if (res.status === 404) {
        setData(null);
        return;
      }
      if (!res.ok) throw new Error("فرم K یافت نشد");
      const result = await res.json();

      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "خطا در بارگذاری فرم K");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trainerId, selectedYear]);

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/monographEvaluation/${data._id}`, {
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
      console.error("Error saving form:", err);
      alert("❌ خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };


  const handleChangeMainField = (field: keyof FormK, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleEvaluationChange = (
    idx: number,
    field: keyof Evaluation,
    value: string | number | boolean
  ) => {
    if (!data) return;
    const newEvaluations = [...data.evaluations];
    newEvaluations[idx] = { ...newEvaluations[idx], [field]: value };
    setData({ ...data, evaluations: newEvaluations });
  };

  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    const detailsWS = XLSX.utils.json_to_sheet([
      { فیلد: "نام", مقدار: data.name },
      { فیلد: "تخلص", مقدار: data.lastName },
      { فیلد: "نام پدر", مقدار: data.parentType },
      { فیلد: "شماره تذکره", مقدار: data.idNumber },
      { فیلد: "رشته", مقدار: data.department },
      { فیلد: "سال آموزش", مقدار: data.trainingYear },
      { فیلد: "سال شروع", مقدار: data.startYear },
      { فیلد: "تاریخ", مقدار: data.date },
      { فیلد: "یادداشت", مقدار: data.evaluations?.[0]?.notes || "" },
    ]);
    XLSX.utils.book_append_sheet(wb, detailsWS, "مشخصات");

    if (data.evaluations?.length) {
      const evalWS = XLSX.utils.json_to_sheet(
        data.evaluations.map((evaluation, idx) => ({
          "#": idx + 1,
          بخش: evaluation.section,
          فیصدی: evaluation.percentage,
          "نمره داده شده": evaluation.score,
          "اسم استاد": evaluation.teacherName,
          ویژگی‌ها: evaluation.characteristics || "",
          یادداشت: evaluation.notes || "",
        }))
      );
      XLSX.utils.book_append_sheet(wb, evalWS, "ارزیابی‌ها");
    }

    XLSX.writeFile(wb, `FormK_${data.name}_${data.lastName}.xlsx`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1100,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <title>فرم K - ${data?.name} ${data?.lastName}</title>
          <style>
            body { font-family: 'Tahoma','Arial',sans-serif; direction: rtl; margin: 20px; line-height:1.6; color:#000;}
            table { width:100%; border-collapse: collapse; margin-bottom:25px; font-size:12px; }
            th, td { border:1px solid #333; padding:6px 8px; text-align:center; }
            th { background-color:#f5f5f5; font-weight:bold; }
            .signature-table td { height:60px; vertical-align:bottom; }
          </style>
        </head>
        <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) return <div className="p-4 text-center">در حال بارگذاری...</div>;
  if (!data)
    return (
      <div className="p-4 text-center text-red-500">
        فرمی برای این ترینر موجود نیست
      </div>
    );

  return (
    <div className="p-4">
      {/* سربرگ */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Form K - فرم ارزیابی مونوگراف</h2>
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
        className="overflow-auto border rounded-lg max-h-[70vh] p-4 bg-white"
      >
        {/* جدول ارزیابی */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-center">
            جدول ارزیابی مونوگراف
          </h4>
          <table className="min-w-full border border-slate-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border w-8">#</th>
                <th className="p-2 border w-1/3">بخش</th>
                <th className="p-2 border w-1/4">فیصدی</th>
                <th className="p-2 border w-1/4">نمره داده شده</th>
                <th className="p-2 border w-1/3">اسم استاد</th>
                <th className="p-2 border w-28">امضای استاد</th>
              </tr>
            </thead>
            <tbody>
              {data.evaluations.map((evaluation, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2 border text-center">{idx + 1}</td>
                  <td className="p-2 border">
                    {editing ? (
                      <input
                        className="w-full border px-1 py-0.5 rounded"
                        value={evaluation.section}
                        onChange={(e) =>
                          handleEvaluationChange(idx, "section", e.target.value)
                        }
                      />
                    ) : (
                      evaluation.section
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {editing ? (
                      <input
                        type="number"
                        className="w-full border px-1 py-0.5 rounded text-center"
                        value={evaluation.percentage}
                        onChange={(e) =>
                          handleEvaluationChange(
                            idx,
                            "percentage",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      evaluation.percentage
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {editing ? (
                      <input
                        type="number"
                        className="w-full border px-1 py-0.5 rounded text-center"
                        value={evaluation.score}
                        onChange={(e) =>
                          handleEvaluationChange(
                            idx,
                            "score",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      evaluation.score
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {editing ? (
                      <input
                        className="w-full border px-1 py-0.5 rounded text-center"
                        value={evaluation.teacherName}
                        onChange={(e) =>
                          handleEvaluationChange(
                            idx,
                            "teacherName",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      evaluation.teacherName
                    )}
                  </td>
                  <td className="p-2 border text-center">______________</td>
                </tr>
              ))}

           
              {/* 🔹 ردیف مجموع و اوسط در یک ردیف */}
<tr className="bg-gray-100 font-semibold">
  <td className="p-2 border text-center" colSpan={3}>
    مجموع نمرات: {data.summary?.total || "—"}
  </td>
  <td className="p-2 border text-center" colSpan={3}>
    اوسط نمرات: {data.summary?.average || "—"}
  </td>
</tr>

{/* 🔹 یادداشت (نوت) */}
<tr className="bg-gray-50">
  <td className="p-2 border text-center" colSpan={6}>
    <strong>یادداشت:</strong>{" "}
    {editing ? (
      <textarea
        className="w-full border rounded p-2 text-sm"
        value={data.summary?.notes || ""}
        onChange={(e) =>
          setData({
            ...data,
            summary: { ...data.summary, notes: e.target.value },
          })
        }
      />
    ) : (
      data.summary?.notes || "—"
    )}
    </td>
   </tr>

              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

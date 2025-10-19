// components/forms/FormGDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormGDetailsProps {
  trainerId: string;
  onClose?: () => void;
}

interface PersonalInfo {
  Name: string;
  parentType: string;
  department: string;
  trainingYear: string;
  year: string;
}

interface Score {
  exam1Written: number;
  exam1Practical: number;
  exam2Written: number;
  exam2Practical: number;
  finalWritten: number;
  finalPractical: number;
  total: number;
  teacherName: string;
}

interface FormG {
  _id: string;
  trainer: string;
  personalInfo: PersonalInfo;
  scores: Score[];
  averageScore: number;
  departmentHead?: string;
  programHead?: string;
  hospitalHead?: string;
}

export default function FormGDetails({ trainerId, onClose }: FormGDetailsProps) {
  const [data, setData] = useState<FormG | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/evaluationFormG?trainerId=${trainerId}`);
        if (res.status === 404) {
          setData(null);
          return;
        }
        if (!res.ok) throw new Error("خطا در دریافت داده‌ها");
        const result = await res.json();
        const form = Array.isArray(result) ? result[0] : result;
        setData({
          ...form,
          scores: form.scores || [],
          personalInfo: form.personalInfo || {
            Name: "",
            parentType: "",
            department: "",
            trainingYear: "",
            year: "",
          },
        });
      } catch (err) {
        console.error("Error fetching Form G:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchData();
  }, [trainerId]);

  const handleChangePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    if (!data) return;
    setData({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const handleScoreChange = (idx: number, field: keyof Score, value: string | number) => {
    if (!data) return;
    const newScores = [...data.scores];
    newScores[idx] = { ...newScores[idx], [field]: value };

    const s = newScores[idx];
    newScores[idx].total =
      Number(s.exam1Written) +
      Number(s.exam1Practical) +
      Number(s.exam2Written) +
      Number(s.exam2Practical) +
      Number(s.finalWritten) +
      Number(s.finalPractical);

    const avg =
      newScores.reduce((acc, cur) => acc + cur.total, 0) / (newScores.length || 1);

    setData({ ...data, scores: newScores, averageScore: parseFloat(avg.toFixed(2)) });
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/evaluationFormG/${data._id}`, {
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

  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const detailsWS = XLSX.utils.json_to_sheet([
      { فیلد: "نام", مقدار: data.personalInfo.Name },
      { فیلد: "نام پدر", مقدار: data.personalInfo.parentType },
      { فیلد: "دیپارتمنت", مقدار: data.personalInfo.department },
      { فیلد: "سال آموزش", مقدار: data.personalInfo.trainingYear },
      { فیلد: "سال", مقدار: data.personalInfo.year },
      { فیلد: "اوسط نمرات", مقدار: data.averageScore },
    ]);
    XLSX.utils.book_append_sheet(wb, detailsWS, "مشخصات");

    if (data.scores?.length) {
      const scoresWS = XLSX.utils.json_to_sheet(
        data.scores.map((score, idx) => ({
          "#": idx + 1,
          "امتحان 4 ماه اول تحریری": score.exam1Written,
          "امتحان 4 ماه اول عملی": score.exam1Practical,
          "امتحان 4 ماه دوم تحریری": score.exam2Written,
          "امتحان 4 ماه دوم عملی": score.exam2Practical,
          "امتحان نهایی تحریری": score.finalWritten,
          "امتحان نهایی عملی": score.finalPractical,
          مجموع: score.total,
          "نام استاد": score.teacherName,
        }))
      );
      XLSX.utils.book_append_sheet(wb, scoresWS, "نمرات");
    }

    const signWS = XLSX.utils.json_to_sheet([
      { مسئول: "رئیس دیپارتمنت", نام: data.departmentHead || "" },
      { مسئول: "آمر برنامه تریننگ", نام: data.programHead || "" },
      { مسئول: "رئیس شفاخانه", نام: data.hospitalHead || "" },
    ]);
    XLSX.utils.book_append_sheet(wb, signWS, "امضاها");

    XLSX.writeFile(wb, `FormG_${data.personalInfo.Name}.xlsx`);
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
          <title>فرم G - ${data?.personalInfo.Name}</title>
          <style>
            body { font-family: 'Tahoma','Arial',sans-serif; direction: rtl; margin: 20px; line-height: 1.6; color: #000; }
            table { width:100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border:1px solid #333; padding:6px; text-align:center; }
            th { background:#f5f5f5; }
            .average-score { font-weight:bold; margin-bottom:20px; text-align:center; }
            @media print { .no-print { display:none !important; } }
          </style>
        </head>
        <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (loading) return <div className="p-4 text-center">در حال بارگذاری...</div>;
  if (!data)
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">فرمی برای این ترینر موجود نیست</div>
        {onClose && <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">بستن</button>}
      </div>
    );

  return (
    <div className="p-4">
      {/* دکمه‌ها */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Form G - فرم ارزیابی امتحانات</h2>
        <div className="space-x-2">
          <button onClick={handlePrint} className="bg-green-600 text-white px-3 py-1 rounded">PDF</button>
          <button onClick={handleExportExcel} className="bg-yellow-500 text-white px-3 py-1 rounded">Excel</button>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-3 py-1 rounded">{saving ? "در حال ذخیره..." : "ذخیره"}</button>
              <button onClick={() => setEditing(false)} className="bg-red-600 text-white px-3 py-1 rounded">لغو</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">ویرایش</button>
          )}
          {onClose && <button onClick={onClose} className="bg-gray-500 text-white px-3 py-1 rounded">بستن</button>}
        </div>
      </div>

      <div ref={printRef} className="overflow-auto border rounded-lg max-h-[70vh] p-4 bg-white">
        {/* مشخصات فردی */}
        <table className="min-w-full border border-slate-300 mb-6">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border">نام</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.personalInfo.Name} onChange={e => handleChangePersonalInfo("Name", e.target.value)} /> : data.personalInfo.Name}</td>
              <td className="font-semibold px-3 py-2 border">نام پدر</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.personalInfo.parentType} onChange={e => handleChangePersonalInfo("parentType", e.target.value)} /> : data.personalInfo.parentType}</td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border">دیپارتمنت</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.personalInfo.department} onChange={e => handleChangePersonalInfo("department", e.target.value)} /> : data.personalInfo.department}</td>
              <td className="font-semibold px-3 py-2 border">سال آموزش</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.personalInfo.trainingYear} onChange={e => handleChangePersonalInfo("trainingYear", e.target.value)} /> : data.personalInfo.trainingYear}</td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border">سال</td>
              <td className="px-3 py-2 border" colSpan={3}>{editing ? <input className="w-full border px-2 py-1 rounded" value={data.personalInfo.year} onChange={e => handleChangePersonalInfo("year", e.target.value)} /> : data.personalInfo.year}</td>
            </tr>
          </tbody>
        </table>

        {/* جدول نمرات */}
        {data.scores?.length > 0 && (
          <table className="min-w-full border border-slate-300 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">#</th>
                <th className="p-2 border">4 ماه اول تحریری</th>
                <th className="p-2 border">4 ماه اول عملی</th>
                <th className="p-2 border">4 ماه دوم تحریری</th>
                <th className="p-2 border">4 ماه دوم عملی</th>
                <th className="p-2 border">نهایی تحریری</th>
                <th className="p-2 border">نهایی عملی</th>
                <th className="p-2 border">مجموع</th>
                <th className="p-2 border">نام استاد</th>
              </tr>
            </thead>
            <tbody>
              {data.scores.map((score, idx) => (
                <tr key={idx}>
                  <td className="p-2 border text-center">{idx + 1}</td>
                  {editing ? (
                    <>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.exam1Written} onChange={e => handleScoreChange(idx,"exam1Written", Number(e.target.value))} /></td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.exam1Practical} onChange={e => handleScoreChange(idx,"exam1Practical", Number(e.target.value))} /></td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.exam2Written} onChange={e => handleScoreChange(idx,"exam2Written", Number(e.target.value))} /></td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.exam2Practical} onChange={e => handleScoreChange(idx,"exam2Practical", Number(e.target.value))} /></td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.finalWritten} onChange={e => handleScoreChange(idx,"finalWritten", Number(e.target.value))} /></td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 text-center rounded" type="number" value={score.finalPractical} onChange={e => handleScoreChange(idx,"finalPractical", Number(e.target.value))} /></td>
                      <td className="p-2 border font-bold text-center">{score.total}</td>
                      <td className="p-2 border"><input className="w-full border px-1 py-0.5 rounded" type="text" value={score.teacherName} onChange={e => handleScoreChange(idx,"teacherName", e.target.value)} /></td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 border text-center">{score.exam1Written}</td>
                      <td className="p-2 border text-center">{score.exam1Practical}</td>
                      <td className="p-2 border text-center">{score.exam2Written}</td>
                      <td className="p-2 border text-center">{score.exam2Practical}</td>
                      <td className="p-2 border text-center">{score.finalWritten}</td>
                      <td className="p-2 border text-center">{score.finalPractical}</td>
                      <td className="p-2 border text-center font-bold">{score.total}</td>
                      <td className="p-2 border">{score.teacherName}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="average-score mb-4 text-center font-bold">اوسط نمرات: {data.averageScore}</div>
             {/* امضاها */}
        <table className="min-w-full border border-slate-300 mb-6">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border text-center">رئیس دیپارتمنت</td>
              <td className="font-semibold px-3 py-2 border text-center">آمر برنامه تریننگ</td>
              <td className="font-semibold px-3 py-2 border text-center">رئیس شفاخانه</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border text-center min-h-[40px]">{data.departmentHead || "____________"}</td>
              <td className="px-3 py-2 border text-center min-h-[40px]">{data.programHead || "____________"}</td>
              <td className="px-3 py-2 border text-center min-h-[40px]">{data.hospitalHead || "____________"}</td>
            </tr>
          </tbody>
        </table>
      </div> {/* پایان ref برای چاپ */}

    </div>
  );
}


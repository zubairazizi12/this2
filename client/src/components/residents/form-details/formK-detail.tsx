// components/forms/FormKDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormKDetailsProps {
  trainerId: string;
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
  supervisor?: string;
  departmentHead?: string;
  programHead?: string;
}

export default function FormKDetails({ trainerId, onClose }: FormKDetailsProps) {
  const [data, setData] = useState<FormK | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/monographEvaluation?trainerId=${trainerId}`);
        if (!res.ok) throw new Error("فرمی برای این ترینر موجود نیست");
        const result = await res.json();
        if (!result) setData(null);
        else if (Array.isArray(result) && result.length > 0) setData(result[0]);
        else if (result && typeof result === "object" && result._id) setData(result);
        else setData(null);
      } catch (err) {
        console.error("Error fetching form K:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchData();
  }, [trainerId]);

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
          یادداشت‌ها: evaluation.notes || "",
        }))
      );
      XLSX.utils.book_append_sheet(wb, evalWS, "ارزیابی‌ها");
    }

    const signWS = XLSX.utils.json_to_sheet([
      { مسئول: "استاد راهنما", نام: data.supervisor || "" },
      { مسئول: "رئیس دیپارتمنت", نام: data.departmentHead || "" },
      { مسئول: "آمر برنامه آموزشی", نام: data.programHead || "" },
    ]);
    XLSX.utils.book_append_sheet(wb, signWS, "امضاها");

    XLSX.writeFile(wb, `FormK_${data.name}_${data.lastName}.xlsx`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1100,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
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
        <body>
          ${printContents}
          <script>window.onload=function(){window.print(); setTimeout(()=>window.close(),100);}</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleChangeMainField = (field: keyof FormK, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleEvaluationChange = (idx: number, field: keyof Evaluation, value: string | number | boolean) => {
    if (!data) return;
    const newEvaluations = [...data.evaluations];
    newEvaluations[idx] = { ...newEvaluations[idx], [field]: value };
    setData({ ...data, evaluations: newEvaluations });
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

      <div ref={printRef} className="overflow-auto border rounded-lg max-h-[70vh] p-4 bg-white">
        {/* مشخصات فردی */}
        <table className="w-full border border-slate-300 mb-6 text-sm">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border bg-gray-50 w-1/6">نام</td>
              <td className="px-3 py-2 border w-1/3">
                {editing ? <input className="w-full border px-2 py-1 rounded" value={data.name} onChange={(e)=>handleChangeMainField("name",e.target.value)}/> : data.name}
              </td>
              <td className="font-semibold px-3 py-2 border bg-gray-50 w-1/6">تخلص</td>
              <td className="px-3 py-2 border w-1/3">
                {editing ? <input className="w-full border px-2 py-1 rounded" value={data.lastName} onChange={(e)=>handleChangeMainField("lastName",e.target.value)}/> : data.lastName}
              </td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border bg-gray-50">ولد</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.parentType} onChange={(e)=>handleChangeMainField("parentType",e.target.value)}/> : data.parentType}</td>
              <td className="font-semibold px-3 py-2 border bg-gray-50">نمبر تذکره</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.idNumber} onChange={(e)=>handleChangeMainField("idNumber",e.target.value)}/> : data.idNumber}</td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border bg-gray-50">رشته</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.department} onChange={(e)=>handleChangeMainField("department",e.target.value)}/> : data.department}</td>
              <td className="font-semibold px-3 py-2 border bg-gray-50">سال تریننگ</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.trainingYear} onChange={(e)=>handleChangeMainField("trainingYear",e.target.value)}/> : data.trainingYear}</td>
            </tr>
            <tr>
              <td className="font-semibold px-3 py-2 border bg-gray-50">سال شمول</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.startYear} onChange={(e)=>handleChangeMainField("startYear",e.target.value)}/> : data.startYear}</td>
              <td className="font-semibold px-3 py-2 border bg-gray-50">تاریخ</td>
              <td className="px-3 py-2 border">{editing ? <input className="w-full border px-2 py-1 rounded" value={data.date} onChange={(e)=>handleChangeMainField("date",e.target.value)}/> : data.date}</td>
            </tr>
          </tbody>
        </table>

        {/* جدول ارزیابی */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-center">جدول ارزیابی مونوگراف</h4>
          <table className="min-w-full border border-slate-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border w-8">#</th>
                <th className="p-2 border w-1/3">بخش</th>
                <th className="p-2 border w-24">فیصدی</th>
                <th className="p-2 border w-48">نمره داده شده</th>
                <th className="p-2 border w-1/3">اسم استاد</th>
                <th className="p-2 border w-28">امضای استاد</th>
              </tr>
            </thead>
            <tbody>
              {data.evaluations.map((evaluation, idx) => (
                <tr key={idx} className={idx%2===0?"bg-white":"bg-gray-50"}>
                  <td className="p-2 border text-center">{idx+1}</td>
                  <td className="p-2 border">{editing ? <input className="w-full border px-1 py-0.5 rounded" value={evaluation.section} onChange={e=>handleEvaluationChange(idx,"section",e.target.value)}/> : evaluation.section}</td>
                  <td className="p-2 border text-center">{editing ? <input type="number" className="w-full border px-1 py-0.5 rounded text-center" value={evaluation.percentage} onChange={e=>handleEvaluationChange(idx,"percentage",Number(e.target.value))}/> : evaluation.percentage}</td>
                  <td className="p-2 border text-center">{editing ? <input type="number" className="w-full border px-1 py-0.5 rounded text-center" value={evaluation.score} onChange={e=>handleEvaluationChange(idx,"score",Number(e.target.value))}/> : evaluation.score}</td>
                  <td className="p-2 border text-center">{editing ? <input className="w-full border px-1 py-0.5 rounded text-center" value={evaluation.teacherName} onChange={e=>handleEvaluationChange(idx,"teacherName",e.target.value)}/> : evaluation.teacherName}</td>
                  <td className="p-2 border text-center">______________</td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0,6-data.evaluations.length) }).map((_,i)=>(
                <tr key={`empty-${i}`} className="bg-white">
                  <td className="p-2 border text-center">{data.evaluations.length+i+1}</td>
                  <td className="p-2 border">&nbsp;</td>
                  <td className="p-2 border">&nbsp;</td>
                  <td className="p-2 border">&nbsp;</td>
                  <td className="p-2 border">&nbsp;</td>
                  <td className="p-2 border text-center">______________</td>
                </tr>
              ))}

              <tr className="bg-gray-100 font-semibold">
                <td className="p-2 border text-center">7</td>
                <td className="p-2 border text-center">مجموع نمرات</td>
                <td className="p-2 border text-center"></td>
                <td className="p-2 border text-center">اوسط</td>
                <td className="p-2 border">&nbsp;</td>
                <td className="p-2 border text-center">______________</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* امضاها */}
        <table className="min-w-full border border-slate-300 signature-table">
          <tbody>
            <tr>
              <td className="font-semibold px-3 py-2 border text-center">استاد راهنما</td>
              <td className="font-semibold px-3 py-2 border text-center">رئیس دیپارتمنت</td>
              <td className="font-semibold px-3 py-2 border text-center">آمر برنامه آموزشی</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border text-center min-h-[50px]">{data.supervisor || "____________"}</td>
              <td className="px-3 py-2 border text-center min-h-[50px]">{data.departmentHead || "____________"}</td>
              <td className="px-3 py-2 border text-center min-h-[50px]">{data.programHead || "____________"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// components/forms/FormDDetails.tsx
import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface FormDDetailsProps {
  trainerId: string;
  onClose?: () => void;
}

interface Conference {
  conferenceTitle: string;
  score: number;
  date: string;
  teacherName: string;
}

interface FormD {
  _id: string;
  trainerId: string;
  trainer: string;
  year: number;
  name: string;
  parentType: string;
  department: string;
  trainingYear: string;
  conferences: Conference[];
  departmentHead?: string;
  programHead?: string;
  hospitalHead?: string;
}

export default function FormDDetails({ trainerId, onClose }: FormDDetailsProps) {
  const [data, setData] = useState<FormD | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/conference?trainerId=${trainerId}`);
        if (!res.ok) throw new Error("فرمی برای این ترینر موجود نیست");
        const result = await res.json();
        if (Array.isArray(result) && result.length > 0) setData(result[0]);
        else if (result && typeof result === "object") setData(result);
        else setData(null);
      } catch (err) {
        console.error("Error fetching form D:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (trainerId) fetchData();
  }, [trainerId]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank", "width=1000,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
      <head><meta charset="UTF-8"><title>Form D</title></head>
      <body>${printRef.current.innerHTML}</body>
      <script>window.print(); setTimeout(()=>window.close(),100);</script>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    const detailsWS = XLSX.utils.json_to_sheet([
      { فیلد: "نام", مقدار: data.name },
      { فیلد: "نام پدر", مقدار: data.parentType },
      { فیلد: "دیپارتمنت", مقدار: data.department },
      { فیلد: "سال آموزش", مقدار: data.trainingYear },
    ]);
    XLSX.utils.book_append_sheet(wb, detailsWS, "مشخصات");

    if (data.conferences?.length) {
      const confWS = XLSX.utils.json_to_sheet(
        data.conferences.map((conf, idx) => ({
          "#": idx + 1,
          "موضوع کنفرانس": conf.conferenceTitle,
          "نمره داده شده": conf.score,
          "تاریخ ارائه": conf.date,
          "اسم و امضا استاد": conf.teacherName,
        }))
      );
      XLSX.utils.book_append_sheet(wb, confWS, "کنفرانس‌ها");
    }

    const signWS = XLSX.utils.json_to_sheet([
      { مسئول: "رئیس دیپارتمنت", نام: data.departmentHead || "" },
      { مسئول: "آمر برنامه تریننگ", نام: data.programHead || "" },
      { مسئول: "رئیس شفاخانه", نام: data.hospitalHead || "" },
    ]);
    XLSX.utils.book_append_sheet(wb, signWS, "امضاها");

    XLSX.writeFile(wb, `FormD_${data.name}_${data.parentType}.xlsx`);
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/conference/${data._id}`, {
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

  const handleChangeMainField = (field: keyof FormD, value: string | number) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleConferenceChange = (idx: number, field: keyof Conference, value: string | number) => {
    if (!data) return;
    const newConferences = [...data.conferences];
    newConferences[idx] = { ...newConferences[idx], [field]: value };
    setData({ ...data, conferences: newConferences });
  };

  if (loading)
    return <div className="p-4 text-center text-gray-600">در حال بارگذاری...</div>;

  if (!data)
    return (
      <div className="p-4 text-center text-red-500">
        فرم برای این ترینر موجود نیست
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Form D - ارزیابی کنفرانس‌ها</h2>
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
              <button onClick={handlePrint} className="bg-green-600 text-white px-3 py-1 rounded">PDF</button>
              <button onClick={handleExportExcel} className="bg-yellow-500 text-white px-3 py-1 rounded">Excel</button>
              <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-3 py-1 rounded">ویرایش</button>
            </>
          )}
          {onClose && (
            <button onClick={onClose} className="bg-gray-500 text-white px-3 py-1 rounded">بستن</button>
          )}
        </div>
      </div>

      <div ref={printRef} className="border rounded-lg p-4 bg-white">
        {/* مشخصات */}
        <table className="w-full border border-slate-300 mb-6">
          <tbody>
            <tr>
              <td className="font-semibold border p-2">نام</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.name}
                    onChange={(e) => handleChangeMainField("name", e.target.value)}
                  />
                ) : data.name}
              </td>
              <td className="font-semibold border p-2">نام پدر</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.parentType}
                    onChange={(e) => handleChangeMainField("parentType", e.target.value)}
                  />
                ) : data.parentType}
              </td>
            </tr>
            <tr>
              <td className="font-semibold border p-2">دیپارتمنت</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.department}
                    onChange={(e) => handleChangeMainField("department", e.target.value)}
                  />
                ) : data.department}
              </td>
              <td className="font-semibold border p-2">سال آموزش</td>
              <td className="border p-2">
                {editing ? (
                  <input
                    className="border rounded px-2 py-1 w-full"
                    value={data.trainingYear}
                    onChange={(e) => handleChangeMainField("trainingYear", e.target.value)}
                  />
                ) : data.trainingYear}
              </td>
            </tr>
          </tbody>
        </table>

        {/* کنفرانس‌ها */}
        {data.conferences?.length > 0 && (
          <table className="w-full border border-slate-300 text-sm mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="border p-2 w-10">#</th>
                <th className="border p-2">موضوع کنفرانس</th>
                <th className="border p-2 w-20">نمره</th>
                <th className="border p-2 w-32">تاریخ ارائه</th>
                <th className="border p-2 w-40">اسم و امضا استاد</th>
              </tr>
            </thead>
            <tbody>
              {data.conferences.map((conf, idx) => (
                <tr key={idx}>
                  <td className="border p-2 text-center">{idx + 1}</td>
                  <td className="border p-2">
                    {editing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={conf.conferenceTitle}
                        onChange={(e) => handleConferenceChange(idx, "conferenceTitle", e.target.value)}
                      />
                    ) : conf.conferenceTitle}
                  </td>
                  <td className="border p-2 text-center">
                    {editing ? (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full text-center"
                        value={conf.score}
                        onChange={(e) => handleConferenceChange(idx, "score", Number(e.target.value))}
                      />
                    ) : conf.score}
                  </td>
                  <td className="border p-2 text-center">
                    {editing ? (
                      <input
                        type="date"
                        className="border rounded px-2 py-1 w-full text-center"
                        value={conf.date}
                        onChange={(e) => handleConferenceChange(idx, "date", e.target.value)}
                      />
                    ) : conf.date}
                  </td>
                  <td className="border p-2">
                    {editing ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={conf.teacherName}
                        onChange={(e) => handleConferenceChange(idx, "teacherName", e.target.value)}
                      />
                    ) : conf.teacherName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* امضاها - غیرقابل ویرایش */}
        <table className="w-full border border-slate-300 mt-4 text-sm">
          <tbody>
            <tr>
              <td className="font-semibold border p-2 text-center">رئیس دیپارتمنت</td>
              <td className="border p-2 text-center">{data.departmentHead || "____________"}</td>
              <td className="font-semibold border p-2 text-center">آمر برنامه تریننگ</td>
              <td className="border p-2 text-center">{data.programHead || "____________"}</td>
              <td className="font-semibold border p-2 text-center">رئیس شفاخانه</td>
              <td className="border p-2 text-center">{data.hospitalHead || "____________"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

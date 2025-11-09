import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface TeacherActivityFormProps {
  trainerId?: string;
  formId?: string; // ✅ اضافه شد
  selectedYear?: string;
  onClose?: () => void;
}

type Activity = {
  _id: string;
  section: string;
  activity: string;
  evaluators: boolean[]; // one per teacher
};

type FormJ = {
  _id: string;
  trainerId: string;
  name: string;
  parentType: string;
  trainingYear: string;
  teachers: string[];
  activities: Activity[];
};

const Check: React.FC<{ on: boolean }> = ({ on }) => (
  <span className="inline-block w-5 h-5 flex items-center justify-center">
    {on && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-4 h-4"
      >
        <path
          fill="currentColor"
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
        />
      </svg>
    )}
  </span>
);

export default function TeacherActivityForm({
  trainerId,
  selectedYear,
  formId,
}: TeacherActivityFormProps) {
  const [data, setData] = useState<FormJ | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

      // 2️⃣ پیدا کردن سال فعلی یا انتخاب‌شده
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) {
        throw new Error(`سال ${targetYearLabel} در trainingHistory یافت نشد`);
      }

      // 3️⃣ گرفتن آیدی فرم مربوط به فعالیت استاد (TeacherActivityForm)
      const formId = yearData.forms?.formJ; // 👈 دقت کن این کلید باید در backend همین نام را داشته باشد

      if (!formId) {
        throw new Error(
          `فرم فعالیت استاد برای ${targetYearLabel} ساخته نشده است`
        );
      }

      // 4️⃣ دریافت خود فرم
      const res = await fetch(
        `http://localhost:5000/api/teacher-activities/form/${formId}`
      );
      if (!res.ok) throw new Error("فرم فعالیت استاد یافت نشد");

      const result = await res.json();

      // 5️⃣ نرمال‌سازی داده‌ها (در صورت نیاز)
      if (result && result.sections) {
        result.sections = result.sections.map((sec: any) => ({
          ...sec,
          activities: sec.activities.map((act: any) => ({
            ...act,
            score: act.score || "",
            teacherSigned: !!act.teacherSigned,
          })),
        }));
      }

      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "خطا در بارگذاری فرم");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trainerId, selectedYear]);

  const handleExportExcel = () => {
    if (!data) return;
    const wsData = [
      ["#", "Section", "Activity", ...(data.teachers || []), "اوسط نمرات"],
      ...(data.activities?.map((act, idx) => {
        const checks = (act.evaluators || []).map((v) => (v ? "✓" : ""));
        const count = (act.evaluators || []).filter(Boolean).length;
        const denom = data.teachers.length || 1;
        const pct = Math.round((count / denom) * 100);
        return [
          idx + 1,
          act.section,
          act.activity,
          ...checks,
          `${count}/${denom} (${pct}%)`,
        ];
      }) || []),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FormJ");
    XLSX.writeFile(wb, "FormJ.xlsx");
  };

  const toggleEvaluator = (actIdx: number, tIdx: number) => {
    if (!data?.activities) return;
    const newActivities = [...data.activities];
    newActivities[actIdx].evaluators = [...newActivities[actIdx].evaluators];
    newActivities[actIdx].evaluators[tIdx] =
      !newActivities[actIdx].evaluators[tIdx];
    setData({ ...data, activities: newActivities });
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher-activities/${data._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("خطا در ذخیره فرم");
      const updated = await res.json();
      setData(updated.form || updated);
      setEditing(false);
      alert("✅ فرم با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره فرم");
    }
  };
  const handlePrint = () => {
    if (!data) return;
    const teachers = data.teachers || [];
    const groupedActivities: Record<string, Activity[]> = {};
    data.activities?.forEach((act) => {
      if (!groupedActivities[act.section]) groupedActivities[act.section] = [];
      groupedActivities[act.section].push(act);
    });

    // build rows HTML
    const rowsHtml = Object.entries(groupedActivities)
      .map(([section, acts]) =>
        acts
          .map((act) => {
            const checksHtml = (act.evaluators || [])
              .map(
                (v) => `<td class="border p-1 text-center">${v ? "✔" : ""}</td>`
              )
              .join("");
            const avgHtml = `<td class="border p-1 text-center"></td>`; // اوسط نمرات خالی
            return `<tr>
              <td class="border p-1 text-right">${act.section}</td>
              <td class="border p-1 text-right">${act.activity}</td>
              ${checksHtml}
              ${avgHtml}
            </tr>`;
          })
          .join("")
      )
      .join("");

    // two extra rows after last activity
    const emptyTeacherCells = teachers
      .map(() => `<td class="border p-1"></td>`)
      .join("");
    const extraRows = `
      <tr>
        <td class="border p-1 text-right" colspan="2">ارایه جواب به سوالات</td>
        ${emptyTeacherCells}
        <td class="border p-1"></td>
      </tr>
      <tr>
        <td class="border p-1 text-right" colspan="2">امضای استادان</td>
        ${emptyTeacherCells}
        <td class="border p-1"></td>
      </tr>
    `;

    // header row
    const teacherHeaders = teachers
      .map((t) => `<th class="p-1 border">${t}</th>`)
      .join("");

    const html = `
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>چک لیست امتحان عملی و نظری - چاپ</title>
          <style>
            @page { size: A4 portrait; margin: 22mm; }
            body { font-family: 'Calibri', sans-serif; direction: rtl; font-size: 12px; margin:8px; padding:8px; color:#111; }
            h1 { text-align:center; font-size:13px; margin-bottom:4px; }
            .info { display:flex; gap:4px; justify-content:space-between; margin-bottom:4px; align-items:center; flex-wrap: wrap; }
            .info .item { display:flex; flex-direction:column; }
            .info .label { font-size:9px; font-weight:600; color:#333; }
            .info .value { font-size:9px; }
            table { width:100%; border-collapse: collapse; page-break-inside:avoid; margin-bottom:4px; font-size:9px; }
            th, td { border:1px solid #333; padding:5px 5px; text-align:center; vertical-align:middle; font-size:9px; }
            th { background:#f3f3f3; font-weight:600; }
            td.text-right { text-align:right; }
            .signatures { display:flex; justify-content:space-between; gap:5px; margin-top:8px; page-break-inside:avoid; }
            .signature { width:23%; text-align:center; }
            .signature .line { margin-top:12px; border-top:1px solid #333; height:4px; }
            tr { page-break-inside: avoid; }
            .small { font-size:8px; color:#444; }
          </style>
        </head>
        <body>
          <h1>چک لیست امتحان عملی و نظری ترین‌های شفاخانه نور</h1>
  
          <div class="info">
            <div class="item"><span class="label">اسم:</span><span class="value">${
              data.name || ""
            }</span></div>
            <div class="item"><span class="label">ولد:</span><span class="value">${
              data.parentType || ""
            }</span></div>
            <div class="item"><span class="label">سال تریننگ:</span><span class="value">${
              data.trainingYear || ""
            }</span></div>
            <div class="item small">تاریخ چاپ: ${new Date().toLocaleDateString()}</div>
          </div>
  
          <table>
            <thead>
              <tr>
                <th class="p-1">بخش</th>
                <th class="p-1">فعالیت</th>
                ${teacherHeaders}
                <th class="p-1">اوسط نمرات</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              ${extraRows}
            </tbody>
          </table>
  
          <div class="signatures">
            <div class="signature"><div class="small">ترینر مربوطه</div><div class="line"></div></div>
            <div class="signature"><div class="small">شف دپارتمنت</div><div class="line"></div></div>
            <div class="signature"><div class="small">آمر پروگرام تریننگ</div><div class="line"></div></div>
            <div class="signature"><div class="small">ریس شفاخانه</div><div class="line"></div></div>
          </div>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1200,height=1600");
    if (!w) {
      alert("پنجره چاپ باز نشد — ممکن است بلاک شده باشد.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();

    setTimeout(() => {
      w.focus();
      w.print();
    }, 400);
  };

  if (loading) return <div className="p-4">در حال بارگذاری...</div>;
  if (!data)
    return (
      <div className="p-4 text-red-600">فرمی برای این ترینر موجود نیست</div>
    );

  const groupedActivities: Record<string, Activity[]> = {};
  data.activities?.forEach((act) => {
    if (!groupedActivities[act.section]) groupedActivities[act.section] = [];
    groupedActivities[act.section].push(act);
  });

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="p-4">
        {/* Buttons */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-4 text-center">
            چک لیست امتحان عملی و نظری ترینی‌های شفاخانه نور
          </h1>
          <div className="space-x-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              چاپ (Print)
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Excel
            </button>
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
          </div>
        </div>

        {/* Printable Area preview (in DOM) */}
        <div
          ref={printRef}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          {/* Header Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">اسم</label>
              <input
                type="text"
                value={data.name || ""}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">ولد</label>
              <input
                type="text"
                value={data.parentType || ""}
                onChange={(e) =>
                  setData({ ...data, parentType: e.target.value })
                }
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">سال ترینینگ</label>
              <input
                type="text"
                value={data.trainingYear || ""}
                onChange={(e) =>
                  setData({ ...data, trainingYear: e.target.value })
                }
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Teachers Editable */}
          {editing && (
            <div className="flex flex-col mb-4">
              <label className="text-sm text-gray-600 mb-1">نام استادها</label>
              <div className="flex gap-2 flex-wrap">
                {data.teachers.map((t, i) => (
                  <input
                    key={i}
                    type="text"
                    value={t}
                    onChange={(e) => {
                      const newTeachers = [...data.teachers];
                      newTeachers[i] = e.target.value;
                      setData({ ...data, teachers: newTeachers });
                    }}
                    className="border rounded px-2 py-1 bg-white text-center w-28"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Table Preview */}
          <table className="min-w-full text-right table-auto border-collapse mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">بخش</th>
                <th className="p-2 border">فعالیت</th>
                {data.teachers.map((t, i) => (
                  <th key={i} className="p-2 border">
                    {t}
                  </th>
                ))}
                <th className="p-2 border font-semibold">اوسط نمرات</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedActivities).map(([section, acts]) =>
                acts.map((act, idx) => {
                  const count = (act.evaluators || []).filter(Boolean).length;
                  const denom = data.teachers.length || 1;
                  const pct = Math.round((count / denom) * 100);
                  return (
                    <tr
                      key={act._id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {idx === 0 && (
                        <td
                          className="p-2 border font-medium"
                          rowSpan={acts.length}
                        >
                          {section}
                        </td>
                      )}
                      <td className="p-2 border">{act.activity}</td>
                      {data.teachers.map((_, tIdx) => (
                        <td key={tIdx} className="p-2 border text-center">
                          {editing ? (
                            <input
                              type="checkbox"
                              checked={act.evaluators[tIdx] || false}
                              onChange={() =>
                                toggleEvaluator(
                                  data.activities!.findIndex(
                                    (a) => a._id === act._id
                                  ),
                                  tIdx
                                )
                              }
                            />
                          ) : (
                            <Check on={act.evaluators[tIdx] || false} />
                          )}
                        </td>
                      ))}
                      <td className="p-2 border text-center">{`${count}/${denom} (${pct}%)`}</td>
                    </tr>
                  );
                })
              )}

              {/* two extra rows */}
              <tr>
                <td className="p-2 border font-medium" colSpan={2}>
                  ارایه جواب به سوالات
                </td>
                {data.teachers.map((_, i) => (
                  <td key={i} className="p-2 border"></td>
                ))}
                <td className="p-2 border"></td>
              </tr>
              <tr>
                <td className="p-2 border font-medium" colSpan={2}>
                  امضای استادان
                </td>
                {data.teachers.map((_, i) => (
                  <td key={i} className="p-2 border"></td>
                ))}
                <td className="p-2 border"></td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm mt-8">
            <div>
              <div className="border-t border-gray-600 mt-8 pt-1">
                ترینر مربوطه
              </div>
            </div>
            <div>
              <div className="border-t border-gray-600 mt-8 pt-1">
                شف دپارتمنت
              </div>
            </div>
            <div>
              <div className="border-t border-gray-600 mt-8 pt-1">
                آمر پروگرام تریننگ
              </div>
            </div>
            <div>
              <div className="border-t border-gray-600 mt-8 pt-1">
                ریس شفاخانه
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

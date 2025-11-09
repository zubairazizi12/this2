import React, { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

interface Activity {
  id: string;
  title: string;
  percent: number;
  notes?: string;
  months: { month: number; checked: boolean }[];
}

interface Section {
  name: string;
  activities: Activity[];
}

interface ChecklistData {
  _id?: string;
  name: string;
  parentType: string;
  trainingYear: string;
  year: string;
  sections: Section[];
}

interface ChecklistFormProps {
  trainerId?: string;
  formId?: string; // ✅ اضافه شد
  selectedYear: string; // 👈 این را اضافه کن
  onClose?: () => void;
}

const monthNames = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];
const months = Array.from({ length: 12 }, (_, i) => i + 1);

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

const ChecklistForm: React.FC<ChecklistFormProps> = ({
  trainerId,
  selectedYear,
  formId,
}) => {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

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

      // 2️⃣ پیدا کردن سال انتخاب‌شده (یا فعلی)
      const targetYearLabel = selectedYear || progress.currentTrainingYear;
      const yearData = progress.trainingHistory.find(
        (y: any) => y.yearLabel === targetYearLabel
      );

      if (!yearData) {
        throw new Error(`سال ${targetYearLabel} در trainingHistory یافت نشد`);
      }

      // 3️⃣ گرفتن آیدی فرم مربوطه
      const formId = yearData.forms?.formF; // 👈 فرم F مخصوص آن سال

      if (!formId) {
        throw new Error(`فرم برای ${targetYearLabel} هنوز ساخته نشده است`);
      }

      // 4️⃣ گرفتن فرم واقعی از سرور
      const res = await fetch(
        `http://localhost:5000/api/checklists/form/${formId}`
      );
      if (!res.ok) throw new Error("فرم یافت نشد");
      const result = await res.json();

      // 5️⃣ نرمال‌سازی داده‌ها
      if (result && result.sections) {
        result.sections = result.sections.map((sec: Section) => ({
          ...sec,
          activities: sec.activities.map((act: Activity) => {
            const monthsMap = new Map<number, boolean>();
            (act.months || []).forEach((m) =>
              monthsMap.set(m.month, !!m.checked)
            );
            const normalized = months.map((m) => ({
              month: m,
              checked: !!monthsMap.get(m),
            }));
            return { ...act, months: normalized };
          }),
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
  }, [trainerId, selectedYear]); // 👈 اینجا selectedYear اضافه شد

  const handleToggleMonth = (sIndex: number, aIndex: number, month: number) => {
    if (!data) return;
    if (!editing) return;
    const newSections = data.sections.map((sec, si) =>
      si === sIndex
        ? {
            ...sec,
            activities: sec.activities.map((act, ai) =>
              ai === aIndex
                ? {
                    ...act,
                    months: act.months.map((m) =>
                      m.month === month ? { ...m, checked: !m.checked } : m
                    ),
                  }
                : act
            ),
          }
        : sec
    );
    setData({ ...data, sections: newSections });
  };

  const handleFieldChange = (field: keyof ChecklistData, value: string) => {
    if (!data) return;
    setData({ ...data, [field]: value } as ChecklistData);
  };

  const handleExportExcel = () => {
    if (!data) return;
    const wsData: any[] = [
      ["بخش", "فعالیت", "٪", ...monthNames, "مجموعه نمرات", "ملاحظات"],
    ];
    data.sections.forEach((sec) => {
      sec.activities.forEach((act) => {
        const checks = months.map((m) =>
          act.months?.find((x) => x.month === m && x.checked) ? "✓" : ""
        );
        const totalChecked = (act.months || []).filter((x) => x.checked).length;
        wsData.push([
          sec.name,
          act.title,
          `${act.percent}%`,
          ...checks,
          totalChecked,
          act.notes || "",
        ]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");
    XLSX.writeFile(wb, `Checklist_${data.name || trainerId}.xlsx`);
  };

  const handlePrint = () => {
    if (!data) return;

    const sectionsHtml = data.sections
      .map((section) => {
        const rows = section.activities
          .map((act) => {
            const monthCells = months
              .map(
                (m) =>
                  `<td class="border p-1 text-center">${
                    act.months?.some((x) => x.month === m && x.checked)
                      ? "✔"
                      : ""
                  }</td>`
              )
              .join("");
            return `
              <tr>
                <td class="border p-1 text-right">${act.title}</td>
                <td class="border p-1 text-center">${act.percent}%</td>
                ${monthCells}
                <td class="border p-1"></td>
                <td class="border p-1">${act.notes || ""}</td>
              </tr>
            `;
          })
          .join("");

        const totalRow =
          section.name === "خصوصیات فردی (24%)"
            ? `<tr class="total-row"><td colSpan="${
                months.length + 3
              }" class="border p-1 text-right">مجموعه کل نمرات</td><td class="border p-1"></td></tr>`
            : "";

        return `
          <h3 class="section-title">${section.name}</h3>
          <table class="section-table">
            <thead>
              <tr>
                <th rowspan="2">فعالیت</th>
                <th rowspan="2">٪</th>
                <th colspan="12">ماه‌ها</th>
                <th rowspan="2">مجموعه نمرات</th>
                <th rowspan="2">ملاحظات</th>
              </tr>
              <tr>
                ${monthNames
                  .map(
                    (m, i) =>
                      `<th>${i + 1}<div style="font-size:7pt">${m}</div></th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>${rows}${totalRow}</tbody>
          </table>
        `;
      })
      .join("");

    const htmlContent = `
      <div id="print-content" style="padding:25mm; font-family:Calibri,sans-serif; font-size:16pt; direction:rtl; color:#111;">
        <h1 style="text-align:center; font-size:10pt; margin-bottom:2px;">چک‌لیست کاری و ارزیابی ماهوار</h1>
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; font-size:7pt; margin-bottom:2px; gap:4px;">
          <div><strong>اسم:</strong> ${data.name || ""}</div>
          <div><strong>ولد:</strong> ${data.parentType || ""}</div>
          <div><strong>سال تریننگ:</strong> ${data.trainingYear || ""}</div>
          <div><strong>سال:</strong> ${data.year || ""}</div>
          <div style="color:#444; font-size:6pt;">تاریخ چاپ: ${new Date().toLocaleDateString()}</div>
        </div>
  
        ${sectionsHtml}
  
        <div style="display:flex; justify-content:space-between; margin-top:4px; gap:4px; font-size:7pt;">
          <div style="width:23%; text-align:center;">ترینر<div style="border-top:1px solid #000; margin-top:2px;"></div></div>
          <div style="width:23%; text-align:center;">شف دپارتمنت<div style="border-top:1px solid #000; margin-top:2px;"></div></div>
          <div style="width:23%; text-align:center;">آمر پروگرام<div style="border-top:1px solid #000; margin-top:2px;"></div></div>
          <div style="width:23%; text-align:center;">ریس شفاخانه<div style="border-top:1px solid #000; margin-top:2px;"></div></div>
        </div>
      </div>
    `;

    const html = `
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8"/>
          <title>چاپ فرم</title>
          <style>
            @page { size:A4 portrait; margin:3mm; }
            body { margin:0; padding:0; overflow:hidden; }
            table { width:100%; border-collapse:collapse; page-break-inside:avoid; font-size:7pt; }
            th, td { border:1px solid #333; padding:1px 2px; text-align:center; }
            h3 { margin:2px 0; font-size:8pt; }
            .total-row { background:#f2f2f2; font-weight:700; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            const content = document.getElementById("print-content");
            content.style.transformOrigin = 'top center';
            window.onload = () => { window.focus(); window.print(); };
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=1200,height=1600");
    if (!w) {
      alert("پنجره چاپ باز نشد");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleSave = async () => {
    if (!data) return;
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/checklists/${trainerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "خطا در ذخیره‌سازی فرم");
      }
      const updated = await res.json();
      setData(updated || data);
      setEditing(false);
      alert("✅ فرم با موفقیت ذخیره شد");
    } catch (err: any) {
      console.error(err);
      alert("❌ خطا در ذخیره‌سازی: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">در حال بارگذاری...</div>;
  if (error) return <div className="p-4 text-red-600">❌ {error}</div>;
  if (!data)
    return (
      <div className="p-4 text-gray-600">فرمی برای این ترینر موجود نیست.</div>
    );

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="p-4">
        {/* Header: title + buttons */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-center flex-1">
            چک‌لیست کاری و ارزیابی ماهوار ترینی‌های شفاخانه نور
          </h1>
          <div className="flex items-center gap-2">
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
                💾 ذخیره
              </button>
            )}
          </div>
        </div>

        {/* Printable preview in DOM */}
        <div
          ref={printRef}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          {/* Header inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">اسم</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
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
                value={data.parentType}
                onChange={(e) =>
                  handleFieldChange("parentType", e.target.value)
                }
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">سال تریننگ</label>
              <input
                type="text"
                value={data.trainingYear}
                onChange={(e) =>
                  handleFieldChange("trainingYear", e.target.value)
                }
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">سال</label>
              <input
                type="text"
                value={data.year}
                onChange={(e) => handleFieldChange("year", e.target.value)}
                className={`border rounded px-3 py-2 text-center ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Sections */}
          {data?.sections?.map((section, sIndex) => (
            <div key={sIndex} className="mb-8 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-2">{section.name}</h2>
              <table className="w-full border-collapse border text-center text-sm bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th rowSpan={2} className="border p-2">
                      فعالیت
                    </th>
                    <th rowSpan={2} className="border p-2">
                      ٪
                    </th>
                    <th colSpan={12} className="border p-2">
                      ماه‌ها
                    </th>
                    <th rowSpan={2} className="border p-2">
                      مجموعه نمرات
                    </th>
                    <th rowSpan={2} className="border p-2 w-40">
                      ملاحظات
                    </th>
                  </tr>
                  <tr>
                    {monthNames.map((month, index) => (
                      <th
                        key={index}
                        className="border p-2 text-xs text-gray-700"
                      >
                        {index + 1}
                        <div className="text-[10px] text-gray-500 mt-1">
                          {month}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.activities.map((act, aIndex) => (
                    <tr key={aIndex}>
                      <td className="border p-2 text-right">{act.title}</td>
                      <td className="border p-2">{act.percent}%</td>
                      {months.map((m) => {
                        const checked = act.months?.some(
                          (x) => x.month === m && x.checked
                        );
                        return (
                          <td key={m} className="border p-1">
                            {editing ? (
                              <input
                                type="checkbox"
                                checked={!!checked}
                                onChange={() =>
                                  handleToggleMonth(sIndex, aIndex, m)
                                }
                                className="w-4 h-4 accent-blue-600"
                              />
                            ) : (
                              <Check on={!!checked} />
                            )}
                          </td>
                        );
                      })}
                      <td className="border p-2 font-semibold">
                        {/* مجموع نمرات محاسبه شده */}
                        {(act.months || []).filter((x) => x.checked).length}
                      </td>
                      <td className="border p-1">
                        <input
                          type="text"
                          value={act.notes || ""}
                          onChange={(e) => {
                            if (!editing) return;
                            const newSections = data.sections.map((sec, si) =>
                              si === sIndex
                                ? {
                                    ...sec,
                                    activities: sec.activities.map((a, ai) =>
                                      ai === aIndex
                                        ? { ...a, notes: e.target.value }
                                        : a
                                    ),
                                  }
                                : sec
                            );
                            setData({ ...data, sections: newSections });
                          }}
                          disabled={!editing}
                          className={`border rounded px-2 py-1 text-sm w-full ${
                            editing ? "bg-white" : "bg-gray-100"
                          }`}
                        />
                      </td>
                    </tr>
                  ))}

                  {section.name === "خصوصیات فردی (24%)" && (
                    <tr className="bg-gray-100 font-semibold">
                      <td
                        colSpan={months.length + 3}
                        className="border p-2 text-right"
                      >
                        مجموعه کل نمرات
                      </td>
                      <td className="border p-2"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

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
};

export default ChecklistForm;

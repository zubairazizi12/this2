import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

interface MonthScore {
  month: number;
  value: number;
}

interface Activity {
  id: string;
  title: string;
  percent: number;
  months: MonthScore[];
  total: number;
}

interface Section {
  name: string;
  activities: Activity[];
}

interface Checklist {
  _id: string;
  trainerId: string;
  name: string;
  parentType: string;
  trainingYear: string;
  sections?: Section[]; // optional for safety
}

interface ChecklistDisplayProps {
  trainerId: string;
}

const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function ChecklistDisplay({ trainerId }: ChecklistDisplayProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempData, setTempData] = useState<Record<string, Checklist>>({});
  const printRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!trainerId) return;
    const fetchChecklists = async () => {
      try {
        const res = await fetch(`/api/checklists?trainerId=${trainerId}`);
        if (!res.ok) throw new Error("خطا در دریافت داده‌ها");
        const data: Checklist[] = await res.json();
        setChecklists(data);
        const tempObj: Record<string, Checklist> = {};
        data.forEach((c) => (tempObj[c._id] = { ...c }));
        setTempData(tempObj);
      } catch (err) {
        console.error(err);
        setChecklists([]);
      }
    };
    fetchChecklists();
  }, [trainerId]);

  const handlePrint = (id: string) => {
    const printFn = useReactToPrint({
      content: () => printRefs.current[id],
      documentTitle: `Checklist_${id}`,
    });
    printFn();
  };

  const handleExportExcel = (checklist: Checklist) => {
    if (!checklist.sections?.length) return alert("❌ داده‌ای برای خروجی نیست");
    const wb = XLSX.utils.book_new();
    checklist.sections.forEach((section) => {
      const wsData = [
        ["فعالیت", "فیصدی", ...months.map((m) => `ماه ${m}`), "مجموعه نمرات"],
      ];
      section.activities.forEach((act) => {
        wsData.push([
          act.title,
          act.percent,
          ...months.map(
            (m) => act.months.find((ms) => ms.month === m)?.value || 0
          ),
          act.total,
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, section.name);
    });
    XLSX.writeFile(wb, `Checklist_${checklist.name}.xlsx`);
  };

  const handleSave = async (id: string) => {
    const current = tempData[id];
    if (!current) return;
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      if (!res.ok) throw new Error("خطا در ذخیره تغییرات");
      const result = await res.json();
      const updated = result.data || result; // support {data:updated} response
      setChecklists((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setEditingId(null);
      alert("✅ تغییرات ذخیره شد");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره تغییرات");
    }
  };

  if (checklists.length === 0)
    return (
      <div className="p-6 text-center text-gray-600">
        چک‌لیستی برای این ترینی موجود نیست.
      </div>
    );

  return (
    <div className="p-4" style={{ fontFamily: "Calibri, sans-serif" }}>
      {checklists.map((checklist) => {
        const isEditing = editingId === checklist._id;
        const currentData = tempData[checklist._id] || checklist;

        if (!currentData || !Array.isArray(currentData.sections)) {
          return (
            <div
              key={checklist._id}
              className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4"
            >
              ⚠️ ساختار داده‌ی فرم ناقص است یا هنوز بارگذاری نشده است.
            </div>
          );
        }

        return (
          <div
            key={checklist._id}
            className="border rounded-lg bg-white shadow-sm p-6 mb-8"
          >
            {/* هدر و دکمه‌ها */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h1 className="text-2xl font-bold mb-4 text-center">
                چک لیست کاری و ارزیابی ماهوار ترینی‌های شفاخانه نور
              </h1>
              <div className="space-x-2">
                <button
                  onClick={() => handlePrint(checklist._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleExportExcel(checklist)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Excel
                </button>
                <button
                  onClick={() =>
                    isEditing ? setEditingId(null) : setEditingId(checklist._id)
                  }
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {isEditing ? "لغو" : "ویرایش"}
                </button>
                {isEditing && (
                  <button
                    onClick={() => handleSave(checklist._id)}
                    className="bg-green-700 text-white px-3 py-1 rounded"
                  >
                    ذخیره
                  </button>
                )}
              </div>
            </div>

            {/* اطلاعات ترینی */}
            <div
              ref={(el) => (printRefs.current[checklist._id] = el)}
              className="border rounded-lg p-4 mb-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <InputField
                  label="نام ترینی"
                  value={currentData.name}
                  editable={isEditing}
                  onChange={(val) =>
                    setTempData({
                      ...tempData,
                      [checklist._id]: { ...currentData, name: val },
                    })
                  }
                />
                <InputField
                  label="ولد"
                  value={currentData.parentType}
                  editable={isEditing}
                  onChange={(val) =>
                    setTempData({
                      ...tempData,
                      [checklist._id]: { ...currentData, parentType: val },
                    })
                  }
                />
                <InputField
                  label="سال آموزشی"
                  value={currentData.trainingYear}
                  editable={isEditing}
                  onChange={(val) =>
                    setTempData({
                      ...tempData,
                      [checklist._id]: { ...currentData, trainingYear: val },
                    })
                  }
                />
              </div>

              {/* جدول‌ها */}
              {currentData.sections.map((section, secIdx) => (
                <SectionTable
                  key={secIdx}
                  section={section}
                  secIdx={secIdx}
                  isEditing={isEditing}
                  checklist={checklist}
                  currentData={currentData}
                  tempData={tempData}
                  setTempData={setTempData}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 🔹 کامپوننت کمکی برای ورودی‌ها
const InputField = ({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (val: string) => void;
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded px-3 py-2 text-center ${
        editable ? "bg-white" : "bg-gray-100"
      }`}
      readOnly={!editable}
    />
  </div>
);

// 🔹 جدول هر بخش
const SectionTable = ({
  section,
  secIdx,
  isEditing,
  checklist,
  currentData,
  tempData,
  setTempData,
}: any) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
      <div
        className={`border border-gray-300 rounded-lg ${
          isEditing ? "min-w-[1000px] overflow-x-auto" : "w-full"
        }`}
      >
        <table className="w-full border-collapse text-center text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="border p-2">فعالیت</th>
              <th className="border p-2">فیصدی</th>
              {months.map((m) => (
                <th key={m} className="border p-2">
                  {m}
                </th>
              ))}
              <th className="border p-2">مجموعه نمرات</th>
            </tr>
          </thead>

          <tbody>
            {section.activities.map((act: Activity, actIdx: number) => (
              <tr key={act.id} className="odd:bg-white even:bg-gray-50">
                {/* ستون فعالیت: همیشه استاتیک */}
                <td className="border p-2 font-bold">{act.title}</td>

                {/* ستون درصدی: همیشه استاتیک */}
                <td className="border p-2 font-bold">{act.percent}%</td>

                {/* ستون‌های ماه‌ها: قابل ویرایش در حالت ویرایش */}
                {months.map((m) => {
                  const monthValue =
                    act.months.find((ms) => ms.month === m)?.value || 0;
                  return (
                    <td key={m} className="border p-1">
                      {isEditing ? (
                        <input
                          type="number"
                          value={monthValue}
                          onChange={(e) => {
                            const newSections = [...currentData.sections];
                            const monthIndex = newSections[secIdx].activities[
                              actIdx
                            ].months.findIndex((ms) => ms.month === m);
                            if (monthIndex >= 0) {
                              newSections[secIdx].activities[actIdx].months[
                                monthIndex
                              ].value = Number(e.target.value);
                            }
                            setTempData({
                              ...tempData,
                              [checklist._id]: {
                                ...currentData,
                                sections: newSections,
                              },
                            });
                          }}
                          className="border rounded px-2 py-1 w-full text-center"
                        />
                      ) : (
                        monthValue
                      )}
                    </td>
                  );
                })}

                {/* مجموع نمرات */}
                <td className="border p-2 font-bold">{act.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

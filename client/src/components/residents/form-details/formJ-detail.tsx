import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

interface TeacherActivityFormProps {
  trainerId: string;
  onClose?: () => void;
}

type Activity = {
  _id: string;
  section: string;
  activity: string;
  evaluators: boolean[];
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
}: TeacherActivityFormProps) {
  const [data, setData] = useState<FormJ | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/teacher-activities/${trainerId}`
        );
        if (!res.ok) throw new Error("فرمی برای این ترینر موجود نیست");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trainerId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "FormJ",
  });

  const handleExportExcel = () => {
    if (!data) return;
    const wsData = [
      ["#", "Section", "Activity", ...(data.teachers || [])],
      ...(data.activities?.map((act, idx) => [
        idx + 1,
        act.section,
        act.activity,
        ...(act.evaluators || []).map((v) => (v ? "✓" : "")),
      ]) || []),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FormJ");
    XLSX.writeFile(wb, "FormJ.xlsx");
  };

  const toggleEvaluator = (actIdx: number, tIdx: number) => {
    if (!data?.activities) return;
    const newActivities = [...data.activities];
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
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-4 text-center">
            چک لیست امتحان عملی و نظری ترینی‌های شفاخانه نور
          </h1>
          <div className="space-x-2">
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

        <div
          ref={printRef}
          className="border rounded-lg p-4 mb-4 bg-white shadow-sm"
        >
          {/* Header Editable */}
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

          {/* Teachers Display */}
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
                    className="border rounded px-2 py-1 bg-white text-center w-28 flex-shrink"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Activities Table */}
          <table className="min-w-full text-right table-auto border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-2 border">بخش</th>
                <th className="p-2 border">فعالیت</th>
                {data.teachers.map((t, i) => (
                  <th key={i} className="p-2 border">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedActivities).map(([section, acts]) =>
                acts.map((act, idx) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

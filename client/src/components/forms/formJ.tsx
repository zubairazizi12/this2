import React, { useState, useEffect } from "react";

interface TeacherActivityFormProps {
  trainerIdProp?: string;
}

const teacherActivities: Record<string, string[]> = {
  "آغاز فعالیت": ["Uniform", "Salam", "Introduction", "Patient add"],
  "شیوه اخذ مشاهده": [
    "CC",
    "PI",
    "Post History",
    "Pers History",
    "S.E State",
    "Drug History",
  ],
  "Review of System": ["Head & Neck", "RS", "CVS", "GIS", "UGS", "CNS", "ENT"],
  "معاینه فزیکی": [
    "Head & Neck",
    "RS",
    "CVS",
    "GIS",
    "UGS",
    "Local Status",
    "Extremities",
  ],
  " نتیجه ": ["Impression", "Action Plan", "Drug Order"],
  " پروسیجر ": [
    "IP",
    "Mask, Hat, Gloves",
    "Surgical Instrument Handling",
    "Kind of Procedure",
  ],
};

interface Activity {
  section: string;
  activity: string;
  evaluators: boolean[];
}

export default function TeacherActivityForm({
  trainerIdProp,
}: TeacherActivityFormProps) {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<string[]>(Array(5).fill(""));
  const [data, setData] = useState<Activity[]>(() =>
    Object.entries(teacherActivities).flatMap(([section, items]) =>
      items.map((item) => ({
        section,
        activity: item,
        evaluators: Array(5).fill(false),
      }))
    )
  );

  // ✅ state های جدید برای سه input
  const [name, setName] = useState("");
  const [parentType, setparentType] = useState("");
  const [trainingYear, setTrainingYear] = useState("");

  // ✅ وقتی trainerIdProp آماده شد، trainerId تنظیم می‌شود و داده از دیتابیس گرفته می‌شود
  useEffect(() => {
    if (!trainerIdProp) {
      alert("هیچ ترینر فعالی یافت نشد!");
      return;
    }

    setTrainerId(trainerIdProp);

    // 👇 دریافت داده از دیتابیس
    const fetchTrainerInfo = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/trainers/${trainerIdProp}`
        );
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "خطا در دریافت ترینر");

        // فرض می‌کنیم دیتابیس این فیلدها را دارد:
        // name, fatherName, trainingYear
        setName(result.name || "");
        setparentType(result.parentType || "");
        setTrainingYear(result.trainingYear || "");
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);

  const handleTeacherName = (index: number, value: string) => {
    setTeachers((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const toggle = (rowIdx: number, teacherIdx: number) => {
    setData((prev) =>
      prev.map((row, i) =>
        i === rowIdx
          ? {
              ...row,
              evaluators: row.evaluators.map((v, j) =>
                j === teacherIdx ? !v : v
              ),
            }
          : row
      )
    );
  };

  const toggleAllForTeacher = (teacherIdx: number) => {
    const allChecked = data.every((row) => row.evaluators[teacherIdx]);
    setData((prev) =>
      prev.map((row) => ({
        ...row,
        evaluators: row.evaluators.map((v, j) =>
          j === teacherIdx ? !allChecked : v
        ),
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trainerId) {
      alert("ابتدا باید یک ترینر ثبت شده انتخاب شود!");
      return;
    }

    const nonEmptyTeachers = teachers.filter((t) => t.trim() !== "");
    if (nonEmptyTeachers.length === 0) {
      alert("حداقل یک نام استاد وارد کنید!");
      return;
    }

    const payload = {
      trainerId,
      name,
      parentType, // الان مقدار واقعی است
      trainingYear,
      teachers: nonEmptyTeachers,
      activities: data,
    };

    try {
      const res = await fetch("http://localhost:5000/api/teacher-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Server error:", result); // ← این را اضافه کن
        throw new Error(result.message || "خطای ناشناخته");
      }

      alert("فرم با موفقیت ذخیره شد ✅");
    } catch (err: any) {
      console.error("Error object:", err); // ← این را اضافه کن
      alert("خطا در ذخیره داده ❌: " + err.message);
    }
  };

  const grouped = Object.entries(teacherActivities);

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }}>
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto p-4 bg-gray-100 rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          چک لیست امتحان عملی و نظری ترینی‌های شفاخانه نور
        </h1>

        {/* ✅ سه input جدید که از دیتابیس پر می‌شوند */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <input
            type="text"
            placeholder="اسم"
            value={name}
            readOnly
            className="border rounded px-3 py-2 text-center bg-gray-200"
          />
          <input
            type="text"
            placeholder="ولد"
            value={parentType}
            readOnly
            className="border rounded px-3 py-2 text-center bg-gray-200"
          />
          <input
            type="text"
            placeholder="سال تریننگ"
            value={trainingYear}
            readOnly
            className="border rounded px-3 py-2 text-center bg-gray-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6 items-center">
          {teachers.map((t, i) => (
            <div key={i} className="flex flex-col items-center">
              <input
                type="text"
                placeholder={`نام استاد ${i + 1}`}
                value={t}
                onChange={(e) => handleTeacherName(i, e.target.value)}
                className="border rounded px-2 py-1 text-center mb-1"
              />
              <button
                type="button"
                onClick={() => toggleAllForTeacher(i)}
                className="text-sm bg-gray-300 hover:bg-gray-400 px-2 py-1 rounded"
              >
                تیک همه / حذف همه
              </button>
            </div>
          ))}
        </div>

        <table className="table-auto border-collapse border border-gray-300 w-full text-center text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">بخش</th>
              <th className="border px-2 py-1">فعالیت</th>
              {teachers.map((t, idx) => (
                <th key={idx} className="border px-2 py-1">
                  {t || `استاد ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(([section, items]) =>
              items.map((item, rowIndex) => {
                const dataIdx = data.findIndex(
                  (d) => d.section === section && d.activity === item
                );
                return (
                  <tr key={section + item} className="even:bg-gray-50">
                    {rowIndex === 0 && (
                      <td
                        rowSpan={items.length}
                        className="border px-2 py-1 font-medium whitespace-nowrap"
                      >
                        {section}
                      </td>
                    )}
                    <td className="border px-2 py-1">{item}</td>
                    {teachers.map((_, tIdx) => (
                      <td key={tIdx} className="border px-2 py-1">
                        <input
                          type="checkbox"
                          checked={data[dataIdx].evaluators[tIdx]}
                          onChange={() => toggle(dataIdx, tIdx)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <button
          type="submit"
          disabled={!trainerId}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          ذخیره
        </button>
      </form>
    </div>
  );
}

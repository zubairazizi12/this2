import React, { useEffect, useState } from "react";

interface Activity {
  id: string;
  title: string;
  percent: number;
}

interface Section {
  name: string;
  activities: Activity[];
}

interface ChecklistProps {
  trainerIdProp?: string;
}

const sections: Section[] = [
  {
    name: "آغاز فعالیت (10%)",
    activities: [
      { id: "uniform", title: "یونیفورم", percent: 6 },
      { id: "coworkers", title: "برخورد با همکاران", percent: 2 },
      { id: "patients", title: "برخورد با مریض", percent: 2 },
    ],
  },
  {
    name: "شیوه اخذ مشاهده (9%)",
    activities: [
      { id: "cc", title: "شهرت مریض", percent: 2 },
      { id: "pi", title: "معاینه فزیکی", percent: 2 },
      { id: "labTests", title: "تجویز معاینات لابراتواری روتین", percent: 2 },
      { id: "diagnosis", title: "تجویز معاینات وصفی و ضمیموی", percent: 3 },
    ],
  },
  {
    name: "انجام مشوره طبی بموقع (6%)",
    activities: [{ id: "consult", title: "انجام مشوره طبی بموقع", percent: 6 }],
  },
  {
    name: "سعی در بلند بردن سطح دانش علمی و مسلکی (27%)",
    activities: [
      { id: "morning", title: "اشتراک فعال در راپو صبحانه", percent: 6 },
      { id: "visits", title: "اشتراک فعال در ویزیت‌ها", percent: 6 },
      { id: "conferences", title: "اشتراک فعال در کنفرانس‌ها", percent: 12 },
      {
        id: "license",
        title: "تقویه یکی از لیسانس‌های معتبر خارجی",
        percent: 1,
      },
      { id: "computer", title: "قدرت استفاده از کمپیوتر و انترنت", percent: 1 },
      { id: "press", title: "استفاده از نشرات مطبوع", percent: 1 },
    ],
  },
  {
    name: "دسپلین (24%)",
    activities: [
      { id: "attendance", title: "حاضر بودن", percent: 6 },
      { id: "obedience", title: "اطاعت از اوامر معقول آمرمافوق", percent: 6 },
      { id: "rules", title: "مراعات مقرره و لوایح تریننگ", percent: 6 },
      { id: "duty", title: "اشتراک در نوکریوالی", percent: 6 },
    ],
  },
  {
    name: "خصوصیات فردی (24%)",
    activities: [
      { id: "expression", title: "افاده بیان", percent: 2 },
      { id: "initiative", title: "ابتکار سالم", percent: 2 },
      { id: "leadership", title: "تصمیم و رهبری", percent: 2 },
      { id: "honesty", title: "راستکاری و همکاری", percent: 4 },
      { id: "resources", title: "استفاده معقول از منابع", percent: 2 },
      { id: "responsibility", title: "مسٔولیت‌پذیری", percent: 2 },
      { id: "evaluation", title: "تحلیل و ارزیابی", percent: 2 },
      { id: "feedback", title: "انتقاد و پیشنهاد سازنده", percent: 2 },
      { id: "individual", title: "رسیدگی به وضع فردی", percent: 2 },
      { id: "social", title: "رابطه اجتماعی", percent: 2 },
      { id: "position", title: "استفاده بجا از موقف کاری", percent: 2 },
    ],
  },
];

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

const ChecklistForm: React.FC<ChecklistProps> = ({ trainerIdProp }) => {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentType, setParentType] = useState("");
  const [trainingYear, setTrainingYear] = useState("");
  const [year, setYear] = useState("");
  const [checks, setChecks] = useState<Record<string, Record<number, boolean>>>(
    {}
  );
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trainerIdProp) {
      setTrainerId(trainerIdProp);
      fetchTrainerInfo(trainerIdProp);
    } else {
      alert("هیچ ترینر فعالی یافت نشد!");
    }
  }, [trainerIdProp]);

  const handleCheckChange = (activityId: string, month: number) => {
    setChecks((prev) => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [month]: !prev[activityId]?.[month],
      },
    }));
  };

  const handleNoteChange = (activityId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [activityId]: value }));
  };

  const toggleMonthColumn = (monthIndex: number) => {
    setChecks((prev) => {
      const newChecks = { ...prev };
      let allChecked = true;

      sections.forEach((section) => {
        section.activities.forEach((act) => {
          if (!newChecks[act.id]?.[monthIndex]) allChecked = false;
        });
      });

      sections.forEach((section) => {
        section.activities.forEach((act) => {
          if (!newChecks[act.id]) newChecks[act.id] = {};
          newChecks[act.id][monthIndex] = !allChecked;
        });
      });

      return newChecks;
    });
  };

  const totalPercent = sections.reduce(
    (sum, section) =>
      sum + section.activities.reduce((acc, act) => acc + act.percent, 0),
    0
  );
  // ✅ تابع دریافت اطلاعات ترینر از API
  const fetchTrainerInfo = async (mongoId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trainers/${mongoId}`);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "خطا در دریافت ترینر");

      // اصلاح دسترسی به فیلدها
      setName(result.trainer?.name || "");
      setParentType(result.trainer?.parentType || ""); // یا lastName
      setTrainingYear(result.trainerProgress?.currentTrainingYear || "");
      setYear(
        result.trainerProgress?.trainingHistory?.at(-1)?.academicYear ||
          new Date().getFullYear().toString()
      );
    } catch (err) {
      console.error("❌ خطا در دریافت اطلاعات ترینر:", err);
      alert("خطا در دریافت اطلاعات ترینر ❌");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // اعتبارسنجی اولیه
    if (!trainerId) return alert("❌ ID ترینر مشخص نیست!");
    if (!name.trim()) return alert("❌ نام ترینی وارد نشده است!");
    if (!parentType.trim()) return alert("❌ ولد وارد نشده است!");
    if (!trainingYear.trim()) return alert("❌ سال آموزشی وارد نشده است!");
    if (!year.trim()) return alert("❌ سال وارد نشده است!");

    // داده آماده برای ارسال
    const dataToSave = {
      trainerId,
      name,
      parentType,
      trainingYear,
      year,
      sections: sections.map((sec) => ({
        name: sec.name,
        activities: sec.activities.map((act) => ({
          id: act.id,
          title: act.title,
          percent: act.percent,
          months: months.map((m) => ({
            month: m,
            checked: checks[act.id]?.[m] || false,
          })),
          notes: notes[act.id] || "",
        })),
      })),
    };

    console.log("Data to save:", dataToSave); // بررسی داده قبل از ارسال

    try {
      const res = await fetch("http://localhost:5000/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const result = await res.json(); // دریافت پاسخ سرور

      if (!res.ok) {
        console.error("Server error:", result);
        return alert("❌ خطا در ذخیره داده! " + (result.message || ""));
      }

      alert("✅ فرم با موفقیت ذخیره شد!");
      console.log("Server response:", result);
    } catch (err: any) {
      console.error("Network or server error:", err);
      alert("❌ خطا در ذخیره داده! " + (err.message || ""));
    }
  };

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "Calibri, sans-serif" }}
      className="font-sans max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg shadow"
    >
      {/* عنوان فورم */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          چک‌لیست کاری و ارزیابی ماهوار ترینی‌های شفاخانه
        </h1>
      </div>

      {/* اطلاعات ترینی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="نام ترینی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="ولد"
          value={parentType}
          onChange={(e) => setParentType(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="سال آموزشی"
          value={trainingYear}
          onChange={(e) => setTrainingYear(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="سال"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />
      </div>

      <form onSubmit={handleSubmit}>
        {sections.map((section) => (
          <div key={section.name} className="mb-10 overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">{section.name}</h2>
            <table className="w-full border-collapse border text-center text-sm bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th rowSpan={2} className="border p-2 align-middle">
                    فعالیت
                  </th>
                  <th rowSpan={2} className="border p-2 align-middle">
                    ٪
                  </th>
                  <th colSpan={12} className="border p-2">
                    ماه‌ها
                  </th>
                  <th rowSpan={2} className="border p-2 align-middle">
                    مجموعه نمرات
                  </th>
                  <th rowSpan={2} className="border p-2 align-middle w-40">
                    ملاحظات
                  </th>
                </tr>
                <tr>
                  {monthNames.map((month, index) => (
                    <th
                      key={index}
                      onClick={() => toggleMonthColumn(index + 1)}
                      className="border p-2 text-xs text-gray-700 cursor-pointer hover:bg-blue-100 transition"
                      title="برای انتخاب یا حذف همه کلیک کنید"
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
                {section.activities.map((act) => (
                  <tr key={act.id}>
                    <td className="border p-2">{act.title}</td>
                    <td className="border p-2">{act.percent}%</td>
                    {months.map((m) => (
                      <td key={m} className="border p-1">
                        <input
                          type="checkbox"
                          checked={checks[act.id]?.[m] || false}
                          onChange={() => handleCheckChange(act.id, m)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </td>
                    ))}
                    <td className="border p-2"></td>
                    <td className="border p-1">
                      <input
                        type="text"
                        value={notes[act.id] || ""}
                        onChange={(e) =>
                          handleNoteChange(act.id, e.target.value)
                        }
                        placeholder="..."
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    </td>
                  </tr>
                ))}

                {/* سطر جدید بعد از آخرین فعالیت */}
                {section.name === "خصوصیات فردی (24%)" && (
                  <tr>
                    <td
                      colSpan={months.length + 3}
                      className="border p-2 text-right font-semibold"
                    >
                      مجموعه کل نمرات
                    </td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        <button
          type="submit"
          className="mt-10 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ذخیره فورم
        </button>
      </form>
    </div>
  );
};

export default ChecklistForm;

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

interface checklistsProps {
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
      {
        id: "postHistory",
        title: "تجویز معاینات لابراتواری روتین",
        percent: 2,
      },
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

const months = Array.from({ length: 12 }, (_, i) => i + 1);

const ChecklistForm: React.FC<checklistsProps> = ({ trainerIdProp }) => {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentType, setParentType] = useState("");
  const [trainingYear, setTrainingYear] = useState("");
  const [scores, setScores] = useState<Record<string, Record<number, number>>>(
    {}
  );

  useEffect(() => {
    if (trainerIdProp) setTrainerId(trainerIdProp);
    else alert("هیچ ترینر فعالی یافت نشد!");
  }, [trainerIdProp]);

  // بارگذاری اطلاعات دانشجو از سرور
  useEffect(() => {
    if (!trainerId) return;

    const fetchStudentData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/trainers/${trainerIdProp}`
        );
        if (!res.ok) throw new Error("Failed to fetch student data");
        const data = await res.json();
        setName(data.name || "");
        setParentType(data.parentType || "");
        setTrainingYear(data.trainingYear || "");
      } catch (err) {
        console.error(err);
        alert("❌ خطا در بارگذاری اطلاعات دانشجو");
      }
    };

    fetchStudentData();
  }, [trainerId]);

  const handleScoreChange = (
    activityId: string,
    month: number,
    value: number
  ) => {
    setScores((prev) => ({
      ...prev,
      [activityId]: { ...prev[activityId], [month]: value },
    }));
  };

  const calculateTotal = (activity: Activity) =>
    Object.values(scores[activity.id] || {}).reduce(
      (sum, v) => sum + (v || 0),
      0
    );

  const calculateSectionTotal = (section: Section) =>
    section.activities.reduce((sum, act) => sum + calculateTotal(act), 0);

  const calculateOverallTotal = () =>
    sections.reduce((sum, sec) => sum + calculateSectionTotal(sec), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId) return alert("❌ ID ترینر مشخص نیست!");

    const dataToSave = {
      trainerId,
      name,
      parentType,
      trainingYear,
      sections: sections.map((sec) => ({
        name: sec.name,
        activities: sec.activities.map((act) => ({
          id: act.id,
          title: act.title,
          percent: act.percent,
          months: months.map((m) => ({
            month: m,
            value: scores[act.id]?.[m] || 0,
          })),
          total: calculateTotal(act),
        })),
        sectionTotal: calculateSectionTotal(sec),
      })),
      overallTotal: calculateOverallTotal(),
    };

    try {
      const res = await fetch("http://localhost:5000/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      const data = await res.json(); // 👈 این را اضافه کن تا پیام دقیق سرور را بگیری

      if (!res.ok) {
        // 👇 اگر سرور خطا داد، پیام دقیق را نمایش بده
        throw new Error(data.error || data.message || "خطای ناشناخته");
      }

      alert("✅ فرم با موفقیت ذخیره شد!");
    } catch (err: any) {
      console.error("❌ خطا در ذخیره داده:", err);
      alert(`❌ خطا در ذخیره داده: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }}>
      <>
        <h1 className="text-2xl font-bold mb-4 text-center">
          چک لیست کاری و ارزیابی ماهوار ترینی‌های شفاخانه نور
        </h1>
        {/* اطلاعات ترینی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="نام ترینی"
            value={name}
            readOnly
            className="border px-3 py-2 rounded-lg bg-gray-200"
          />
          <input
            type="text"
            placeholder="ولد"
            value={parentType}
            readOnly
            className="border px-3 py-2 rounded-lg bg-gray-200"
          />
          <input
            type="text"
            placeholder="سال آموزشی"
            value={trainingYear}
            readOnly
            className="border px-3 py-2 rounded-lg bg-gray-200"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-xl shadow-md"
        >
          {/* جدول‌ها */}
          <div>
            {sections.map((section) => (
              <div key={section.name} className="mb-10 min-w-[900px]">
                <h2 className="text-lg font-semibold mb-2">{section.name}</h2>
                <table className="w-full border text-center text-sm bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border">فعالیت</th>
                      <th className="p-2 border">فیصدی</th>
                      {months.map((m) => (
                        <th key={m} className="p-2 border">
                          {m}
                        </th>
                      ))}
                      <th className="p-2 border">مجموعه نمرات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.activities.map((act) => (
                      <tr key={act.id}>
                        <td className="p-2 border">{act.title}</td>
                        <td className="p-2 border">{act.percent}%</td>
                        {months.map((m) => (
                          <td key={m} className="p-2 border">
                            <input
                              type="number"
                              min={0}
                              max={act.percent}
                              value={scores[act.id]?.[m] || ""}
                              onChange={(e) =>
                                handleScoreChange(
                                  act.id,
                                  m,
                                  Number(e.target.value)
                                )
                              }
                              className="w-6 h-5 text-xs border rounded text-center p-0"
                            />
                          </td>
                        ))}
                        <td className="p-2 border font-bold">
                          {calculateTotal(act)}
                        </td>
                      </tr>
                    ))}

                    {/* مجموع بخش */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="p-2 border" colSpan={2}>
                        مجموع بخش
                      </td>
                      {months.map((m) => {
                        const totalPerMonth = section.activities.reduce(
                          (sum, act) => sum + (scores[act.id]?.[m] || 0),
                          0
                        );
                        return (
                          <td key={m} className="p-2 border">
                            {totalPerMonth}
                          </td>
                        );
                      })}
                      <td className="p-2 border">
                        {calculateSectionTotal(section)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* مجموع کل */}
          <div className="text-right font-bold text-lg mb-4">
            مجموع کل نمرات: {calculateOverallTotal()}
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ذخیره
          </button>
        </form>
      </>
    </div>
  );
};

export default ChecklistForm;

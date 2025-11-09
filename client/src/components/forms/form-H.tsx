import React, { useState, useEffect } from "react";
interface EvaluationFormHProps {
  trainerIdProp?: string;
}

type TrainingYear = {
  year: string;
  totalScore: string;
  instructor: string;
};

export default function EvaluationFormH({
  trainerIdProp,
}: EvaluationFormHProps) {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  // 🔹 معلومات شخصی
  const [Name, setName] = useState("");
  const [parentType, setparentType] = useState("");
  const [department, setDepartment] = useState("");
  const [trainingYear, setTrainingYear] = useState("");

  // 🔹 جدول سال‌های ترینینگ
  const [years, setYears] = useState<TrainingYear[]>([
    { year: "سال اول", totalScore: "", instructor: "" },
    { year: "سال دوم", totalScore: "", instructor: "" },
    { year: "سال سوم", totalScore: "", instructor: "" },
    { year: "سال چهارم", totalScore: "", instructor: "" },
  ]);

  const [averageScore, setAverageScore] = useState("");
  const [shiftDepartment, setShiftDepartment] = useState("");
  const [programDirector, setProgramDirector] = useState("");
  //////////////////////////////////////////
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
        setName(result.trainer?.name || "");
        setparentType(result.trainer?.parentType || "");
        setDepartment(result.trainer?.department || "");
        setTrainingYear(result.trainerProgress?.currentTrainingYear || "");
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);
  /////////////////////////////////////////

  const inputClass = "border px-2 py-2 w-full text-center";

  // 📊 تغییر نمره یا استاد در جدول
  const handleYearChange = (
    index: number,
    field: keyof TrainingYear,
    value: string
  ) => {
    const updated = [...years];
    updated[index][field] = value;
    setYears(updated);

    // محاسبه اوسط نمرات
    const validScores = updated
      .map((y) => parseFloat(y.totalScore))
      .filter((s) => !isNaN(s));
    if (validScores.length > 0) {
      const avg =
        validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
      setAverageScore(avg.toFixed(2));
    } else {
      setAverageScore("");
    }
  };

  // 💾 ذخیره فرم با ولیدیشن کامل
  const handleSubmit = async () => {
    if (!trainerId) {
      alert("❌ Trainer ID موجود نیست، فرم ذخیره نمی‌شود!");
      return;
    }

    // ✅ بررسی فیلدهای اصلی
    if (!Name.trim() || !parentType.trim() || !department.trim()) {
      alert("⚠️ لطفاً تمام فیلدهای معلومات شخصی را پُر کنید.");
      return;
    }

    // ✅ بررسی جدول نمرات
    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      if (!y.totalScore.trim() || !y.instructor.trim()) {
        alert(
          `⚠️ لطفاً تمام فیلدهای ردیف ${y.year} را پُر کنید (نمره و نام استاد).`
        );
        return;
      }
      if (isNaN(parseFloat(y.totalScore))) {
        alert(`⚠️ نمره ${y.year} باید عددی باشد.`);
        return;
      }
    }

    // ✅ بررسی فیلدهای نهایی
    if (
      !averageScore.trim() ||
      !shiftDepartment.trim() ||
      !trainingYear.trim()||
      !programDirector.trim()
    ) {
      alert(
        "⚠️ لطفاً اوسط نمرات، شف دپارتمان و آمر برنامه آموزشی را پُر کنید."
      );
      return;
    }

    // ✅ آماده‌سازی داده برای ارسال
    const payload = {
      trainer: trainerId,
      Name: Name.trim(),
      parentType: parentType.trim(),
      department: department.trim(),
      trainingYear: trainingYear.trim(),
      trainingYears: years.map((y) => ({
        ...y,
        totalScore: y.totalScore.trim(),
        instructor: y.instructor.trim(),
      })),
      averageScore: averageScore.trim(),
      shiftDepartment: shiftDepartment.trim(),
      programDirector: programDirector.trim(),
    };

    console.log("📤 ارسال فرم:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/evaluationFormH", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("خطا در ذخیره فرم");
      alert("✅ فرم با موفقیت ذخیره شد!");

      // 🧹 پاک‌سازی فرم بعد از ذخیره
      setName("");
      setparentType("");
      setDepartment("");
      setTrainingYear("");
      setYears([
        { year: "سال اول", totalScore: "", instructor: "" },
        { year: "سال دوم", totalScore: "", instructor: "" },
        { year: "سال سوم", totalScore: "", instructor: "" },
        { year: "سال چهارم", totalScore: "", instructor: "" },
      ]);
      setAverageScore("");
      setShiftDepartment("");
      setProgramDirector("");
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره فرم");
    }
  };

  // 🧱 UI
  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-4">
        فورم مخصوص درج نمرات سال‌های دوران ترینینگ
      </h2>

      {!trainerId && (
        <p className="text-center text-red-500 mb-4">
          در حال دریافت شناسه ترینر...
        </p>
      )}

      {/* 📋 معلومات شخصی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="نام"
          value={Name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="نام پدر"
          value={parentType}
          onChange={(e) => setparentType(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="دپارتمان"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className={inputClass}
        />
        {/* ✅ فیلد جدید: سال ترینینگ */}
        <input
          type="text"
          placeholder="سال تریننگ)"
          value={trainingYear}
          onChange={(e) => setTrainingYear(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* 📊 جدول نمرات سال‌های ترینینگ */}
      <table className="table-auto border-collapse border w-full text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-2">سال</th>
            <th className="border px-2 py-2">مجموع نمرات</th>
            <th className="border px-2 py-2">نام استاد</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-2">{y.year}</td>
              <td className="border px-2 py-2">
                <input
                  type="number"
                  value={y.totalScore}
                  onChange={(e) =>
                    handleYearChange(idx, "totalScore", e.target.value)
                  }
                  className={inputClass}
                />
              </td>
              <td className="border px-2 py-2">
                <input
                  type="text"
                  value={y.instructor}
                  onChange={(e) =>
                    handleYearChange(idx, "instructor", e.target.value)
                  }
                  className={inputClass}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📈 اوسط و بخش پایانی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <input
          type="text"
          placeholder="اوسط نمرات"
          value={averageScore}
          onChange={(e) => setAverageScore(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="شف دپارتمان"
          value={shiftDepartment}
          onChange={(e) => setShiftDepartment(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="آمر برنامه آموزشی"
          value={programDirector}
          onChange={(e) => setProgramDirector(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!trainerId}
          className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          ذخیره فرم
        </button>
      </div>
    </div>
  );
}

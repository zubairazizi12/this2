import React, { useState, useEffect } from "react";
interface ScoreRow {
  score: string;
  teacherName: string;
}

interface EvaluationFormEProps {
  trainerIdProp?: string; // ✅ گرفتن trainerId از والد یا Context
}

export default function EvaluationFormE({
  trainerIdProp,
}: EvaluationFormEProps) {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  // 🔹 State‌های فرم
  const [name, setName] = useState("");
  const [parentType, setparentType] = useState("");
  const [trainingYear, setTrainingYear] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [date, setDate] = useState("");
  const [averageScore, setAverageScore] = useState("");
  const [scores, setScores] = useState<ScoreRow[]>(
    Array.from({ length: 5 }, () => ({ score: "", teacherName: "" }))
  );

  ////////////////////////////////////
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
        setTrainingYear(result.trainerProgress?.currentTrainingYear || "");
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);
  //////////////////////////////////////
  const inputClass = "border rounded px-2 py-2 w-full text-center";

  // 🔸 محاسبه اوسط نمرات
  useEffect(() => {
    const filled = scores.filter((r) => r.score.trim() && r.teacherName.trim());
    if (filled.length === 0) {
      setAverageScore("");
      return;
    }

    const sum = filled.reduce((acc, r) => acc + (parseFloat(r.score) || 0), 0);
    const avg = sum / filled.length;
    setAverageScore(avg.toFixed(2));
  }, [scores]);

  // 💾 ارسال فرم
  // 💾 ارسال فرم با ولیدیشن کامل
  const handleSubmit = async () => {
    if (!trainerId) {
      alert("❌ Trainer ID موجود نیست، فرم ارسال نمی‌شود!");
      return;
    }

    // 🔹 بررسی فیلدهای اصلی
    const requiredFields = {
      name,
      parentType,
      trainingYear,
      incidentTitle,
      date,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value.trim()) {
        alert("⚠️ لطفاً تمام فیلدهای اصلی را پُر کنید.");
        return;
      }
    }

    // 🔹 بررسی ردیف‌های جدول نمرات
    for (let i = 0; i < scores.length; i++) {
      const row = scores[i];
      const { score, teacherName } = row;

      // یکی پر و دیگری خالی نباشد
      if (
        (score.trim() && !teacherName.trim()) ||
        (!score.trim() && teacherName.trim())
      ) {
        alert(
          `⚠️ لطفاً ردیف شماره ${i + 1} را کامل پُر کنید (نمره و نام استاد).`
        );
        return;
      }
    }

    // حداقل یک ردیف پر باشد
    const filledRows = scores.filter(
      (r) => r.score.trim() && r.teacherName.trim()
    );
    if (filledRows.length === 0) {
      alert("⚠️ لطفاً حداقل یک نمره ثبت کنید.");
      return;
    }

    // 🔹 آماده‌سازی داده برای ارسال
    const payload = {
      trainer: trainerId,
      Name: name.trim(),
      parentType: parentType.trim(),
      trainingYear: trainingYear.trim(),
      incidentTitle: incidentTitle.trim(),
      date: date.trim(),
      averageScore: averageScore.trim(),
      scores: filledRows.map((r) => ({
        score: r.score.trim(),
        teacherName: r.teacherName.trim(),
      })),
    };

    console.log("📤 ارسال فرم:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/evaluationFormE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "❌ خطا در ذخیره فرم");
        return;
      }

      alert("✅ فرم با موفقیت ذخیره شد!");

      // 🧹 ریست فرم
      setName("");
      setparentType("");
      setTrainingYear("");
      setIncidentTitle("");
      setDate("");
      setAverageScore("");
      setScores(
        Array.from({ length: 5 }, () => ({ score: "", teacherName: "" }))
      );
    } catch (err) {
      console.error(err);
      alert("❌ خطا در ذخیره فرم");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-4">
        فرم ارزشیابی سالانه دستیار
      </h2>

      {!trainerId && (
        <p className="text-red-500 text-center mb-4">
          در حال دریافت شناسه ترینر...
        </p>
      )}

      {/* اطلاعات پایه */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="اسم"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="ولد"
          value={parentType}
          onChange={(e) => setparentType(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="سال تریننگ"
          value={trainingYear}
          onChange={(e) => setTrainingYear(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="تاریخ"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* جدول نمرات */}
      <table className="table-auto border-collapse border w-full text-center mb-6">
        <thead>
          <tr>
            <th className="border px-2 py-2">عنوان واقعه</th>
            <th className="border px-2 py-2">نمره داده شده</th>
            <th className="border px-2 py-2">اسم استاد</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((row, idx) => (
            <tr key={idx}>
              {idx === 0 && (
                <td rowSpan={scores.length + 1}>
                  <textarea
                    placeholder="عنوان واقعه"
                    rows={10}
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    className={inputClass + " h-full resize-none"}
                  />
                </td>
              )}
              <td>
                <input
                  type="text"
                  placeholder="نمره"
                  className={inputClass}
                  value={row.score}
                  onChange={(e) => {
                    const newRows = [...scores];
                    newRows[idx].score = e.target.value;
                    setScores(newRows);
                  }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="اسم استاد"
                  className={inputClass}
                  value={row.teacherName}
                  onChange={(e) => {
                    const newRows = [...scores];
                    newRows[idx].teacherName = e.target.value;
                    setScores(newRows);
                  }}
                />
              </td>
            </tr>
          ))}

          {/* اوسط نمرات */}
          <tr>
            <td colSpan={2} className="border px-2 py-2 font-bold">
              اوسط نمرات
            </td>
            <td>
              <input
                type="text"
                value={averageScore}
                readOnly
                className={inputClass + " bg-gray-100"}
              />
            </td>
          </tr>
        </tbody>
      </table>
      {/* دکمه ذخیره */}
      <div className="text-center mt-4">
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

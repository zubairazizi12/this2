import React, { useState, useEffect } from "react";
interface ConferenceRow {
  id: number;
  conferenceTitle: string;
  score: string;
  date: string;
  teacherName: string;
}

interface EvaluationFormDProps {
  trainerIdProp?: string; // ✅ گرفتن trainerId از والد (در صورت وجود)
}

export default function EvaluationFormD({
  trainerIdProp,
}: EvaluationFormDProps) {
const [trainerId, setTrainerId] = useState<string | null>(null);
  // 🧾 state‌های فرم
  const [year, setYear] = useState("");
  const [name, setName] = useState("");
  const [parentType, setparentType] = useState("");
  const [department, setDepartment] = useState("");
  const [trainingYear, setTrainingYear] = useState("");

  const [rows, setRows] = useState<ConferenceRow[]>([
    { id: 1, conferenceTitle: "", score: "", date: "", teacherName: "" },
    { id: 2, conferenceTitle: "", score: "", date: "", teacherName: "" },
    { id: 3, conferenceTitle: "", score: "", date: "", teacherName: "" },
    { id: 4, conferenceTitle: "", score: "", date: "", teacherName: "" },
  ]);

  const inputClass = "border px-2 py-1 w-full text-center";

  // 🧩 تابع برای تغییر ردیف‌های جدول
  const handleChangeRow = <K extends keyof ConferenceRow>(
    index: number,
    field: K,
    value: ConferenceRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };
///////////////////////////////////
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
        setDepartment(result.department||"");
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);
///////////////////////////////
  // 💾 ارسال داده به سرور
  // 💾 ارسال داده به سرور با ولیدیشن کامل
  const handleSubmit = async () => {
    if (!trainerId) {
      alert("❌ Trainer ID خالی است و نمی‌توان فرم را ذخیره کرد.");
      return;
    }

    // 🔹 بررسی فیلدهای عمومی (اطلاعات فردی)
    const requiredFields = {
      year,
      name,
      parentType,
      department,
      trainingYear,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value.trim()) {
        alert("⚠️ لطفاً تمام فیلدهای اطلاعات عمومی را پُر کنید.");
        return;
      }
    }

    // 🔹 بررسی تمام ردیف‌های جدول کنفرانس‌ها
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (
        !row.conferenceTitle.trim() ||
        !row.score.trim() ||
        !row.date.trim() ||
        !row.teacherName.trim()
      ) {
        alert(`⚠️ لطفاً تمام خانه‌های ردیف شماره ${i + 1} را پُر کنید.`);
        return;
      }
    }

    // ✅ اگر همه‌چیز پُر است، payload بساز و ارسال کن
    const conferences = rows.map(
      ({ conferenceTitle, score, date, teacherName }) => ({
        conferenceTitle,
        score,
        date,
        teacherName,
      })
    );

    const payload = {
      trainer: trainerId,
      year,
      name,
      parentType,
      department,
      trainingYear,
      conferences,
    };

    console.log("📤 ارسال داده:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/conference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ خطا در ذخیره: " + (data.message || "Unknown error"));
        console.error("Server error:", data);
        return;
      }

      alert("✅ فرم با موفقیت ذخیره شد!");

      // 🧹 ریست فرم بعد از ذخیره موفق
      setYear("");
      setName("");
      setparentType("");
      setDepartment("");
      setTrainingYear("");
      setRows([
        { id: 1, conferenceTitle: "", score: "", date: "", teacherName: "" },
        { id: 2, conferenceTitle: "", score: "", date: "", teacherName: "" },
        { id: 3, conferenceTitle: "", score: "", date: "", teacherName: "" },
        { id: 4, conferenceTitle: "", score: "", date: "", teacherName: "" },
      ]);
    } catch (err) {
      console.error("❌ خطا در ارسال:", err);
      alert("❌ مشکل در ارتباط با سرور");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-4">
        فرم ارزشیابی کنفرانس
      </h2>

      {/* پیام وضعیت trainer */}
      {!trainerId && (
        <p className="text-red-500 text-center mb-4">
          در حال دریافت شناسه ترینر...
        </p>
      )}

      {/* اطلاعات عمومی */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label>سال</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label>اسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label>ولد</label>
          <input
            type="text"
            value={parentType}
            onChange={(e) => setparentType(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label>دیپارتمنت</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label>سال تریننگ</label>
          <input
            type="text"
            value={trainingYear}
            onChange={(e) => setTrainingYear(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* جدول کنفرانس‌ها */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-2">شماره</th>
              <th className="border px-2 py-2">موضوع کنفرانس</th>
              <th className="border px-2 py-2">نمره داده شده</th>
              <th className="border px-2 py-2">تاریخ ارائه</th>
              <th className="border px-2 py-2">اسم و امضا استاد</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="border px-2 py-2">{row.id}</td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    value={row.conferenceTitle}
                    onChange={(e) =>
                      handleChangeRow(index, "conferenceTitle", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={row.score}
                    onChange={(e) =>
                      handleChangeRow(index, "score", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    placeholder="تاریخ"
                    value={row.date}
                    onChange={(e) =>
                      handleChangeRow(index, "date", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="text"
                    placeholder="نام استاد / امضا"
                    value={row.teacherName}
                    onChange={(e) =>
                      handleChangeRow(index, "teacherName", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* دکمه ذخیره */}
      <div className="text-center mt-6">
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

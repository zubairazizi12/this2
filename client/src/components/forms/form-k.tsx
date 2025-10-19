import React, { useState, useEffect } from "react";
import { useTrainer } from "@/context/TrainerContext";

interface MonographEvaluation {
  section: string;
  percentage: string;
  score: string;
  teacherName: string;
  teacherSigned: boolean;
  characteristics: string;
  total: string;
  average: string;
  notes: string;
}

interface MonographEvaluationFormProps {
  trainerIdProp?: string; // ✅ دریافت trainerId از props
}

export default function MonographEvaluationForm({
  trainerIdProp,
}: MonographEvaluationFormProps) {
  const [trainerId, setTrainerId] = useState<string | null>(null);
  // 🔹 مشخصات شخصی
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    lastName: "",
    parentType: "",
    idNumber: "",
    department: "",
    trainingYear: "",
    startYear: "",
    date: "",
  });

  const handleChangePersonal = (
    field: keyof typeof personalInfo,
    value: string
  ) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const inputClass = "border px-2 py-1 text-center w-full";

  // 🔹 جدول ارزیابی
  const [evaluations, setEvaluations] = useState<MonographEvaluation[]>([
    {
      section: "شیوه تحریر و ترتیب مونوگراف",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
    {
      section: "حاکمیت و شیوه ارائه موضوع",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
    {
      section: "ارائه جواب به سوالات راجع به موضوع",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
    {
      section: "دفاع از موضوع تحقیق",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
    {
      section: "ارائه جوابات به سوالات افاقی",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
    {
      section: "کرکترستیک",
      percentage: "",
      score: "",
      teacherName: "",
      teacherSigned: false,
      characteristics: "",
      total: "",
      average: "",
      notes: "",
    },
  ]);
  ///////////////////////////////////////
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
        setPersonalInfo((prev) => ({
          ...prev,
          name: result.name || "",
          lastName: result.lastName || "",
          parentType: result.parentType || "",
          trainingYear: result.trainingYear || "",
          idNumber: result.idNumber || "",
          department: result.department || "",
        }));
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);
  //////////////////////////////////////

  const handleEvalChange = (
    index: number,
    field: keyof MonographEvaluation,
    value: string | boolean
  ) => {
    const updated = [...evaluations];
    (updated[index] as any)[field] = value;
    setEvaluations(updated);
  };

  // ✅ تابع ولیدیشن قبل از ارسال
  const validateForm = () => {
    // 🔸 بررسی trainerId
    if (!trainerId) {
      alert("❌ Trainer ID موجود نیست، فرم ذخیره نمی‌شود!");
      return false;
    }

    // 🔸 بررسی خالی نبودن تمام فیلدهای شخصی
    for (const [key, value] of Object.entries(personalInfo)) {
      if (!value.trim()) {
        alert(`⚠️ لطفاً فیلد "${key}" را پُر کنید.`);
        return false;
      }
    }

    // 🔸 بررسی جدول ارزیابی
    for (let i = 0; i < evaluations.length; i++) {
      const ev = evaluations[i];
      if (!ev.percentage.trim() || !ev.score.trim() || !ev.teacherName.trim()) {
        alert(`⚠️ لطفاً تمام فیلدهای ردیف "${ev.section}" را پُر کنید.`);
        return false;
      }
      if (isNaN(parseFloat(ev.score))) {
        alert(`⚠️ نمره در بخش "${ev.section}" باید عددی باشد.`);
        return false;
      }
    }

    // 🔸 بررسی مجموع نمرات، اوسط و ملاحظات
    const firstEval = evaluations[0];
    if (
      !firstEval.total.trim() ||
      !firstEval.average.trim() ||
      !firstEval.notes.trim()
    ) {
      alert("⚠️ لطفاً مجموع نمرات، اوسط و ملاحظات را پُر کنید.");
      return false;
    }

    return true;
  };

  // 💾 ذخیره فرم
  // درون MonographEvaluationForm --> handleSubmit
  const handleSubmit = async () => {
    // ولیدیشن پایه (همین‌جا می‌تونید عمیق‌تر اضافه کنید)
    if (!trainerId) {
      alert("❌ هیچ ترینر فعالی یافت نشد!");
      return;
    }
    // مثال ولیدیشن: تمام فیلدهای شخصی باید پر شده باشند
    for (const [k, v] of Object.entries(personalInfo)) {
      if (!v.trim()) {
        alert(`لطفاً فیلد ${k} را پر کنید.`);
        return;
      }
    }
    // ارزیابی‌ها هم کامل باشند
    for (let i = 0; i < evaluations.length; i++) {
      const e = evaluations[i];
      if (!e.percentage.trim() || !e.score.trim() || !e.teacherName.trim()) {
        alert(`ردیف "${e.section}" ناقص است — همه فیلدها را پر کنید.`);
        return;
      }
    }

    // **اینجا: payload سطح بالا می‌سازیم (نه personalInfo)**
    const payload = {
      trainer: trainerId,
      name: personalInfo.name.trim(),
      lastName: personalInfo.lastName.trim(),
      parentType: personalInfo.parentType.trim(),
      idNumber: personalInfo.idNumber.trim(),
      department: personalInfo.department.trim(),
      trainingYear: personalInfo.trainingYear.trim(),
      startYear: personalInfo.startYear.trim(),
      date: personalInfo.date.trim(),
      evaluations: evaluations.map((e) => ({
        section: e.section,
        percentage: e.percentage.trim(),
        score: e.score.trim(),
        teacherName: e.teacherName.trim(),
        teacherSigned: !!e.teacherSigned,
        characteristics: (e.characteristics || "").trim(),
        total: (e.total || "").trim(),
        average: (e.average || "").trim(),
        notes: (e.notes || "").trim(),
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/api/monographEvaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // تلاش برای خواندن پاسخ سرور برای پیام خطا دقیق‌تر
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("Server responded with error:", body);
        alert("❌ خطا در ارسال فرم: " + (body?.message || res.statusText));
        return;
      }

      alert("✅ فرم با موفقیت ذخیره شد!");

      // ریست فرم — همان‌طور که قبلاً دارید

      // 🔹 ریست کردن تمام فیلدهای شخصی
      setPersonalInfo({
        name: "",
        lastName: "",
        parentType: "",
        idNumber: "",
        department: "",
        trainingYear: "",
        startYear: "",
        date: "",
      });

      // 🔹 ریست جدول ارزیابی به مقدار اولیه
      setEvaluations([
        {
          section: "شیوه تحریر و ترتیب مونوگراف",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
        {
          section: "حاکمیت و شیوه ارائه موضوع",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
        {
          section: "ارائه جواب به سوالات راجع به موضوع",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
        {
          section: "دفاع از موضوع تحقیق",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
        {
          section: "ارائه جوابات به سوالات افاقی",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
        {
          section: "کرکترستیک",
          percentage: "",
          score: "",
          teacherName: "",
          teacherSigned: false,
          characteristics: "",
          total: "",
          average: "",
          notes: "",
        },
      ]);
    } catch (err) {
      console.error("Network or fetch error:", err);
      alert("❌ خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-4">
        فرم ارزیابی مونوگراف
      </h2>

      {!trainerId && (
        <p className="text-center text-red-500 mb-4">
          در حال دریافت شناسه ترینر...
        </p>
      )}

      {/* 🔹 معلومات شخصی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(personalInfo).map(([key, value]) => (
          <input
            key={key}
            type="text"
            placeholder={key}
            value={value}
            onChange={(e) =>
              handleChangePersonal(
                key as keyof typeof personalInfo,
                e.target.value
              )
            }
            className={inputClass}
          />
        ))}
      </div>

      {/* 🔹 جدول ارزیابی */}
      <table className="table-auto border-collapse border w-full text-center mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-2">بخش‌ها</th>
            <th className="border px-2 py-2">فیصدی</th>
            <th className="border px-2 py-2">نمره داده شده</th>
            <th className="border px-2 py-2">اسم استاد</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((evalItem, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-2">{evalItem.section}</td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={evalItem.percentage}
                  onChange={(e) =>
                    handleEvalChange(idx, "percentage", e.target.value)
                  }
                />
              </td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={evalItem.score}
                  onChange={(e) =>
                    handleEvalChange(idx, "score", e.target.value)
                  }
                />
              </td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={evalItem.teacherName}
                  onChange={(e) =>
                    handleEvalChange(idx, "teacherName", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}

          <tr>
            <td className="border px-2 py-2">مجموع نمرات</td>
            <td className="border px-2 py-2">
              <input
                className={inputClass}
                value={evaluations[0].total}
                onChange={(e) => handleEvalChange(0, "total", e.target.value)}
              />
            </td>
            <td className="border px-2 py-2">اوسط</td>
            <td className="border px-2 py-2">
              <input
                className={inputClass}
                value={evaluations[0].average}
                onChange={(e) => handleEvalChange(0, "average", e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🔹 ملاحظات */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          ملاحظات / نظر هیئت اداری
        </label>
        <textarea
          className="border w-full p-2 rounded"
          rows={4}
          value={evaluations[0].notes}
          onChange={(e) => handleEvalChange(0, "notes", e.target.value)}
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

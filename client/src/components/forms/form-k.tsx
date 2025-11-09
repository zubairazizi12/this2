import React, { useState, useEffect } from "react";

interface MonographEvaluation {
  section: string;
  percentage: string;
  score: string;
  teacherName: string;
  teacherSigned: boolean;
  characteristics: string;
}

interface Summary {
  total: string;
  average: string;
  notes: string;
}

interface MonographEvaluationFormProps {
  trainerIdProp?: string; // ✅ حفظ شده
}

export default function MonographEvaluationForm({ trainerIdProp }: MonographEvaluationFormProps) {
  const [trainerId, setTrainerId] = useState<string | null>(null);

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

  const fieldLabels: Record<string, string> = {
    name: "نام",
    lastName: "تخلص",
    parentType: "نام پدر",
    idNumber: "نمبر تذکره",
    department: "دیپارتمنت",
    trainingYear: "سال آموزشی",
    startYear: "سال شروع",
    date: "تاریخ",
  };

  const inputClass = "border px-2 py-1 text-center w-full";

  const [evaluations, setEvaluations] = useState<MonographEvaluation[]>([
    { section: "شیوه تحریر و ترتیب مونوگراف", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
    { section: "حاکمیت و شیوه ارائه موضوع", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
    { section: "ارائه جواب به سوالات راجع به موضوع", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
    { section: "دفاع از موضوع تحقیق", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
    { section: "ارائه جوابات به سوالات افاقی", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
    { section: "کرکترستیک", percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" },
  ]);

  // 🔹 مجموع، اوسط و نوت جدا
  const [summary, setSummary] = useState<Summary>({
    total: "",
    average: "",
    notes: "",
  });

  // 💡 محاسبه خودکار مجموع و اوسط
  useEffect(() => {
    const numericScores = evaluations.map(e => parseFloat(e.score)).filter(s => !isNaN(s));
    if (numericScores.length === 0) return;

    const total = numericScores.reduce((a, b) => a + b, 0);
    const average = (total / numericScores.length).toFixed(2);

    setSummary(prev => ({ ...prev, total: total.toString(), average }));
  }, [evaluations.map(e => e.score).join(",")]);

  // 🔹 حفظ useEffect اصلی شما
  useEffect(() => {
    if (!trainerIdProp) {
      alert("هیچ ترینر فعالی یافت نشد!");
      return;
    }

    setTrainerId(trainerIdProp);

    const fetchTrainerInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/trainers/${trainerIdProp}`);
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "خطا در دریافت ترینر");

        setPersonalInfo((prev) => ({
          ...prev,
          name: result.trainer?.name || "",
          lastName: result.trainer?.lastName || "",
          parentType: result.trainer?.parentType || "",
          trainingYear: result.trainerProgress?.currentTrainingYear || "",
          idNumber: result.trainer?.idNumber || "",
          department: result.trainer?.department || "",
        }));
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);

  const handleEvalChange = (index: number, field: keyof MonographEvaluation, value: string | boolean) => {
    const updated = [...evaluations];
    (updated[index] as any)[field] = value;
    setEvaluations(updated);
  };

  const handleSummaryChange = (field: keyof Summary, value: string) => {
    setSummary(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePersonal = (field: keyof typeof personalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!trainerId) {
      alert("هیچ ترینر فعالی یافت نشد!");
      return;
    }

    // 💾 ساخت payload با summary جدا
    const payload = {
      trainer: trainerId,
      ...personalInfo,
      evaluations: evaluations.map(e => ({
        section: e.section,
        percentage: e.percentage.trim(),
        score: e.score.trim(),
        teacherName: e.teacherName.trim(),
        teacherSigned: !!e.teacherSigned,
        characteristics: (e.characteristics || "").trim(),
      })),
      summary: { ...summary },
    };

    try {
      const res = await fetch("http://localhost:5000/api/monographEvaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        alert("خطا در ارسال فرم: " + (body?.message || res.statusText));
        return;
      }

      alert("✅ فرم با موفقیت ذخیره شد!");

      // ریست فرم
      setPersonalInfo({ name: "", lastName: "", parentType: "", idNumber: "", department: "", trainingYear: "", startYear: "", date: "" });
      setEvaluations(evaluations.map(e => ({ ...e, percentage: "", score: "", teacherName: "", teacherSigned: false, characteristics: "" })));
      setSummary({ total: "", average: "", notes: "" });

    } catch (err) {
      console.error(err);
      alert("❌ خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-center mb-4">فرم ارزیابی مونوگراف</h2>

      {/* فیلدهای شخصی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(personalInfo).map(([key, value]) => (
          <input
            key={key}
            type="text"
            placeholder={fieldLabels[key] || key}
            value={value}
            onChange={e => handleChangePersonal(key as keyof typeof personalInfo, e.target.value)}
            className={inputClass}
          />
        ))}
      </div>

      {/* جدول ارزیابی */}
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
          {evaluations.map((e, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-2">{e.section}</td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={e.percentage}
                  onChange={ev => handleEvalChange(idx, "percentage", ev.target.value)}
                />
              </td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={e.score}
                  onChange={ev => handleEvalChange(idx, "score", ev.target.value)}
                />
              </td>
              <td className="border px-2 py-2">
                <input
                  className={inputClass}
                  value={e.teacherName}
                  onChange={ev => handleEvalChange(idx, "teacherName", ev.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* مجموع، اوسط و نوت جدا */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className={inputClass}
          placeholder="مجموع نمرات"
          value={summary.total}
          onChange={e => handleSummaryChange("total", e.target.value)}
        />
        <input
          className={inputClass}
          placeholder="اوسط"
          value={summary.average}
          onChange={e => handleSummaryChange("average", e.target.value)}
        />
        <textarea
          className="border w-full p-2 rounded"
          placeholder="ملاحظات / نظر هیئت اداری"
          rows={3}
          value={summary.notes}
          onChange={e => handleSummaryChange("notes", e.target.value)}
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

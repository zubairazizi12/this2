import React, { useState, useMemo, useEffect } from "react";

interface ChecklistsProps {
  trainerIdProp?: string;
}

const RotationForm: React.FC<ChecklistsProps> = ({ trainerIdProp }) => {
  const [header, setHeader] = useState({
    name: "",
    parentType: "",
    parentName: "",
    department: "",
    trainingYear: "",
    rotationName: "",
    rotationFrom: "",
    rotationTo: "",
    date: "",
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const persianTopics = [
    "اشتراک در کنفرانس",
    "اشتراک در تدریس/سمینار",
    "کارهای عملی و تیوری",
    "اخلاق طبی",
    "حفظ نظم/اشتراک",
  ];

  const [persianRows, setPersianRows] = useState(
    persianTopics.map(() => ({
      mark: 0,
      teacherName: "",
      teacherSign: "",
      note: "",
    }))
  );

  const [persianNote, setPersianNote] = useState("");
  const [trainerId, setTrainerId] = useState<string | null>(null);

  // English competencies table
  const englishCompetencies = [
    "Describe basics of radiographic & magnetic resonance imaging techniques and indications",
    "describe indications and approaches for radiographic and MR imaging  techniques in ophthalmology",
    "detailed interpretation of skull & orbit radiographs",
    "Interpretation of chest radiographs",
    "interoretion of limbs and spine radiographs",
    "Detailed interpretation of brain & orbit CT simple radiographs and with contrast enhancement techniques",
    "Interpretation of brain MRI in different techniques (e.g, Gadolinium, fat, suppression technique and FLAIR)",
    "Conducting and interpretation of MRA (Magnetic resonance Angiography) for eye diseases",
  ];

  const [rows, setRows] = useState(
    englishCompetencies.map(() => ({
      weeks: [
        { cases: "", level: "" },
        { cases: "", level: "" },
        { cases: "", level: "" },
        { cases: "", level: "" },
      ],
      total: 0,
    }))
  );

  const handlePersianChange = (row: number, field: string, value: string) => {
    const updated = [...persianRows];
    (updated as any)[row][field] = value;
    setPersianRows(updated);
  };

  const handleEnglishChange = (
    rowIndex: number,
    weekIndex: number,
    field: "cases" | "level",
    value: string
  ) => {
    const updated = [...rows];
    updated[rowIndex].weeks[weekIndex][field] = value;
    const total = updated[rowIndex].weeks.reduce((sum, w) => {
      const c = parseInt(w.cases, 10);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);
    updated[rowIndex].total = total;
    setRows(updated);
  };

  const grandTotal = useMemo(
    () => rows.reduce((s, r) => s + r.total, 0),
    [rows]
  );

  useEffect(() => {
    if (!trainerIdProp) alert("هیچ ترینر فعالی یافت نشد!");
  }, [trainerIdProp]);

  useEffect(() => {
    if (!trainerIdProp) return;

    const fetchStudentData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/trainers/${trainerIdProp}`
        );
        if (!res.ok) throw new Error("اطلاعات محصل موجود نیست");

        const data = await res.json();

        // ست کردن header از داده API
        if (data) {
          setHeader({
            name: data.name || "",
            parentType: data.parentType || "",
            parentName: data.parentName || "",
            department: data.department || "",
            trainingYear: data.trainingYear || "",
            rotationName: data.rotationName || "",
            rotationFrom: data.rotationFrom || "",
            rotationTo: data.rotationTo || "",
            date: data.date || "",
          });
        }
      } catch (err: any) {
        console.error(err);
        alert("❌ خطا در دریافت اطلاعات محصل: " + err.message);
      }
    };

    fetchStudentData();
  }, [trainerIdProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trainerIdProp) {
      alert("❌ TrainerId ارسال نشده است. لطفاً بررسی کنید!");
      return;
    }

    if (!header.name || !header.trainingYear) {
      alert("⚠️ لطفاً تمام معلومات عمومی را تکمیل کنید!");
      return;
    }

    const payload = {
      trainerId: trainerIdProp, // ✅ مستقیماً از props استفاده کن
      header,
      persianRows,
      persianNote,
      rows,
    };

    console.log("📦 ارسال به سرور:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/rotation-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "خطای ناشناخته");

      alert("✅ فرم با موفقیت ذخیره شد");
    } catch (err: any) {
      console.error("❌ خطا در ذخیره فرم:", err);
      alert("❌ خطا در ذخیره فرم: " + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }}>
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto p-6 bg-gray-100 rounded-xl shadow-md space-y-10"
      >
        {/* عنوان */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold mb-1 text-gray-800">
            فورم مخصوص درج نمرات سیکل شفاخانه چشم نور
          </h1>
        </div>

        {/* کارت اطلاعات عمومی و جدول فارسی */}
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { field: "name", placeholder: "نام محصل" },
              { field: "parentType", placeholder: "اسم پدر" },
              { field: "parentName", placeholder: "اسم پدر کلان" },
              { field: "department", placeholder: "دیپارتمنت" },
              { field: "trainingYear", placeholder: "سال ترینینگ" },
              { field: "rotationName", placeholder: "نام روتیشن" },
              { field: "rotationFrom", placeholder: "Rotation From" },
              { field: "rotationTo", placeholder: "Rotation To" },
              { field: "date", placeholder: "تاریخ" },
            ].map((item) => (
              <input
                key={item.field}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder={item.placeholder}
                value={(header as any)[item.field]}
                onChange={(e) => handleHeaderChange(item.field, e.target.value)}
              />
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-300">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-blue-100 font-semibold text-gray-800">
                  <th className="border p-3">موضوع کنفرانس</th>
                  <th className="border p-3">نمره</th>
                  <th className="border p-3">نام استاد</th>
                  <th className="border p-3">امضا</th>
                  <th className="border p-3">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {persianRows.map((row, i) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="border p-3 font-medium text-gray-800">
                      {persianTopics[i]}
                    </td>
                    {["mark", "teacherName", "teacherSign", "note"].map((f) => (
                      <td key={f} className="border p-2">
                        <input
                          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                          value={(row as any)[f]}
                          onChange={(e) =>
                            handlePersianChange(i, f, e.target.value)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* یادداشت */}
            <div className="mt-4 text-right">
              <label className="block font-medium text-gray-700 mb-1">
                یادداشت (مثلاً: از ۵٪ نمره داده شده است)
              </label>
            </div>
          </div>
        </div>

        {/* جدول انگلیسی */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Rotation Competencies</h2>
          <div className="overflow-x-auto">
            <table className="w-full border text-center border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th rowSpan={2} className="border p-2">
                    Competence
                  </th>
                  {["1st", "2nd", "3rd", "4th"].map((w) => (
                    <th key={w} colSpan={2} className="border p-2">
                      {w} Week
                    </th>
                  ))}
                  <th rowSpan={2} className="border p-2">
                    Total of Cases
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <th className="border p-1">Cases</th>
                      <th className="border p-1">Level</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    <td className="border p-2 text-left">
                      {englishCompetencies[ri]}
                    </td>
                    {row.weeks.map((w, wi) => (
                      <React.Fragment key={wi}>
                        <td className="border p-1">
                          <input
                            type="number"
                            min={0}
                            className="w-full border p-1 text-center rounded"
                            value={w.cases}
                            onChange={(e) =>
                              handleEnglishChange(
                                ri,
                                wi,
                                "cases",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border p-1">
                          <input
                            type="text"
                            className="w-full border p-1 text-center rounded"
                            placeholder="مثلاً: 1-2,2,3"
                            value={w.level}
                            onChange={(e) =>
                              handleEnglishChange(
                                ri,
                                wi,
                                "level",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="border p-1 bg-gray-50 font-bold">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border p-2 text-right" colSpan={9}>
                    Grand Total of Cases
                  </td>
                  <td className="border p-2">{grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ذخیره فرم
        </button>
      </form>
    </div>
  );
};

export default RotationForm;

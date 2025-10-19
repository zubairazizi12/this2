import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

interface RotationFormViewProps {
  trainerId: string;
}

const persianTopics = [
  "اشتراک در کنفرانس",
  "اشتراک در تدریس/سمینار",
  "کارهای عملی و تیوری",
  "اخلاق طبی",
  "حفظ نظم/اشتراک",
];

const englishCompetencies = [
  "Describe basics of radiographic & magnetic resonance imaging techniques and indications",
  "Describe indications and approaches for radiographic and MR imaging techniques in ophthalmology",
  "Detailed interpretation of skull & orbit radiographs",
  "Interpretation of chest radiographs",
  "Interpretation of limbs and spine radiographs",
  "Detailed interpretation of brain & orbit CT simple radiographs and with contrast enhancement techniques",
  "Interpretation of brain MRI in different techniques (e.g., Gadolinium, fat suppression technique and FLAIR)",
  "Conducting and interpretation of MRA (Magnetic resonance Angiography) for eye diseases",
];

type WeekData = { cases: number; level: string };

type RotationRow = {
  weeks: WeekData[];
  total: number;
};

type RotationForm = {
  _id: string;
  header: {
    name: string;
    parentType: string;
    parentName: string;
    department: string;
    trainingYear: string;
    rotationName: string;
    rotationFrom: string;
    rotationTo: string;
    date: string;
  };
  persianRows: {
    mark: number;
    teacherName: string;
    teacherSign: string;
    note: string;
  }[];
  rows: RotationRow[];
};

export default function RotationFormView({ trainerId }: RotationFormViewProps) {
  const [forms, setForms] = useState<RotationForm[]>([]);
  const [editing, setEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/rotation-form/${trainerId}`
        );
        if (!res.ok) throw new Error("فرمی برای این ترینر موجود نیست");
        const data = await res.json();
        setForms(data);
      } catch (err) {
        console.error(err);
        setForms([]);
      }
    };
    fetchData();
  }, [trainerId]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "RotationForm",
  });

  const handleExportExcel = (form: RotationForm) => {
    const wsData: any[] = [
      [
        "اسم محصل",
        "اسم پدر",
        "اسم پدرکلان",
        "دیپارتمنت",
        "سال ترینینگ",
        "نام روتیشن",
        "Rotation From",
        "Rotation To",
        "تاریخ",
      ],
      [
        form.header.name,
        form.header.parentType,
        form.header.parentName,
        form.header.department,
        form.header.trainingYear,
        form.header.rotationName,
        form.header.rotationFrom,
        form.header.rotationTo,
        form.header.date,
      ],
      [],
      ["Persian Evaluation"],
      ["Topic", "Mark", "Teacher Name", "Teacher Sign", "Note"],
      ...form.persianRows.map((r, i) => [
        persianTopics[i] || "",
        r.mark,
        r.teacherName,
        r.teacherSign,
        r.note,
      ]),
      [],
      ["English Competencies"],
      [
        "Competence",
        "W1 Cases",
        "W1 Level",
        "W2 Cases",
        "W2 Level",
        "W3 Cases",
        "W3 Level",
        "W4 Cases",
        "W4 Level",
        "Total",
      ],
      ...form.rows.map((r, i) => [
        englishCompetencies[i] || "",
        ...r.weeks.flatMap((w) => [w.cases, w.level]),
        r.total,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RotationForm");
    XLSX.writeFile(wb, `RotationForm_${form.header.name}.xlsx`);
  };

  const handlePersianChange = (
    formIndex: number,
    rowIndex: number,
    field: string,
    value: any
  ) => {
    const updatedForms = [...forms];
    updatedForms[formIndex] = {
      ...updatedForms[formIndex],
      persianRows: [...updatedForms[formIndex].persianRows],
    };
    updatedForms[formIndex].persianRows[rowIndex] = {
      ...updatedForms[formIndex].persianRows[rowIndex],
      [field]: value,
    };
    setForms(updatedForms);
  };

  const handleWeekChange = (
    formIndex: number,
    rowIndex: number,
    weekIndex: number,
    field: "cases" | "level",
    value: any
  ) => {
    const updatedForms = [...forms];
    updatedForms[formIndex] = {
      ...updatedForms[formIndex],
      rows: [...updatedForms[formIndex].rows],
    };
    updatedForms[formIndex].rows[rowIndex] = {
      ...updatedForms[formIndex].rows[rowIndex],
      weeks: [...updatedForms[formIndex].rows[rowIndex].weeks],
    };
    updatedForms[formIndex].rows[rowIndex].weeks[weekIndex] = {
      ...updatedForms[formIndex].rows[rowIndex].weeks[weekIndex],
      [field]: field === "cases" ? Number(value) : value,
    };
    updatedForms[formIndex].rows[rowIndex].total = updatedForms[formIndex].rows[
      rowIndex
    ].weeks.reduce((sum, w) => sum + w.cases, 0);
    setForms(updatedForms);
  };

  const handleSaveToServer = async (form: RotationForm) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rotation-form/form/${form._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      alert("فرم با موفقیت ذخیره شد ✅");
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره‌سازی ❌");
    }
  };

  if (forms.length === 0)
    return (
      <div className="p-4 text-center text-gray-700 bg-gray-50 rounded-lg shadow">
        فرمی برای این ترینر موجود نیست ❌
      </div>
    );

  const headerLabels: Record<string, string> = {
    name: "اسم محصل",
    parentType: "اسم پدر",
    parentName: "اسم پدرکلان",
    department: "دیپارتمنت",
    trainingYear: "سال ترینینگ",
    rotationName: "نام روتیشن",
    rotationFrom: "شروع روتیشن",
    rotationTo: "پایان روتیشن",
    date: "تاریخ",
  };

  return (
    <div style={{ fontFamily: "Calibri, sans-serif" }} className="p-4">
      {forms.map((form, fi) => {
        const grandTotal = form.rows.reduce((sum, r) => sum + r.total, 0);
        return (
          <div
            key={form._id}
            className="border rounded-lg bg-white shadow p-4 mb-6"
          >
            {/* Header Buttons */}
            <div className="flex flex-wrap justify-end gap-2 mb-4">
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                PDF
              </button>
              <button
                onClick={() => handleExportExcel(form)}
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
                  onClick={() => handleSaveToServer(form)}
                  className="bg-green-700 text-white px-3 py-1 rounded"
                >
                  ذخیره
                </button>
              )}
            </div>

            <div ref={printRef}>
              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {Object.entries(form.header).map(([key, value], idx) => (
                  <div key={idx} className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">
                      {headerLabels[key as keyof typeof headerLabels] || key}
                    </label>
                    <input
                      type="text"
                      readOnly={!editing}
                      value={value}
                      onChange={(e) => {
                        if (editing) {
                          const updatedForms = [...forms];
                          updatedForms[fi] = {
                            ...updatedForms[fi],
                            header: {
                              ...updatedForms[fi].header,
                              [key]: e.target.value,
                            },
                          };
                          setForms(updatedForms);
                        }
                      }}
                      className={`border rounded px-2 py-1 text-center ${
                        editing ? "bg-white" : "bg-gray-100"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Persian Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">
                  ارزیابی فارسی
                </h3>
                <table className="min-w-full border-collapse text-center text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">موضوع</th>
                      <th className="border p-2">نمره</th>
                      <th className="border p-2">نام استاد</th>
                      <th className="border p-2">امضا</th>
                      <th className="border p-2">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.persianRows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="border p-2">{persianTopics[i]}</td>
                        <td className="border p-2">
                          {editing ? (
                            <input
                              type="number"
                              value={r.mark}
                              onChange={(e) =>
                                handlePersianChange(
                                  fi,
                                  i,
                                  "mark",
                                  Number(e.target.value)
                                )
                              }
                              className="border px-1 py-0.5 w-16 text-center"
                            />
                          ) : (
                            r.mark
                          )}
                        </td>
                        <td className="border p-2">
                          {editing ? (
                            <input
                              type="text"
                              value={r.teacherName}
                              onChange={(e) =>
                                handlePersianChange(
                                  fi,
                                  i,
                                  "teacherName",
                                  e.target.value
                                )
                              }
                              className="border px-1 py-0.5"
                            />
                          ) : (
                            r.teacherName
                          )}
                        </td>
                        <td className="border p-2">
                          {editing ? (
                            <input
                              type="text"
                              value={r.teacherSign}
                              onChange={(e) =>
                                handlePersianChange(
                                  fi,
                                  i,
                                  "teacherSign",
                                  e.target.value
                                )
                              }
                              className="border px-1 py-0.5"
                            />
                          ) : (
                            r.teacherSign
                          )}
                        </td>
                        <td className="border p-2">
                          {editing ? (
                            <input
                              type="text"
                              value={r.note}
                              onChange={(e) =>
                                handlePersianChange(
                                  fi,
                                  i,
                                  "note",
                                  e.target.value
                                )
                              }
                              className="border px-1 py-0.5"
                            />
                          ) : (
                            r.note
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* English Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Rotation Competencies
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg text-sm text-center">
                    <thead className="bg-gray-100">
                      <tr>
                        <th rowSpan={2} className="border p-2 w-64">
                          Competence
                        </th>
                        {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
                          <th key={w} colSpan={2} className="border p-2">
                            {w}
                          </th>
                        ))}
                        <th rowSpan={2} className="border p-2">
                          Total
                        </th>
                      </tr>
                      <tr>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="border p-1">Cases</th>
                            <th className="border p-1">Level</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.rows.map((r, ri) => (
                        <tr key={ri}>
                          <td className="border p-2 text-left font-medium">
                            {englishCompetencies[ri]}
                          </td>
                          {r.weeks.map((w, wi) => (
                            <React.Fragment key={wi}>
                              <td className="border p-2">
                                {editing ? (
                                  <input
                                    type="number"
                                    value={w.cases}
                                    onChange={(e) =>
                                      handleWeekChange(
                                        fi,
                                        ri,
                                        wi,
                                        "cases",
                                        e.target.value
                                      )
                                    }
                                    className="border px-1 py-0.5 w-16 text-center"
                                  />
                                ) : (
                                  w.cases
                                )}
                              </td>
                              <td className="border p-2">
                                {editing ? (
                                  <input
                                    type="text"
                                    value={w.level}
                                    onChange={(e) =>
                                      handleWeekChange(
                                        fi,
                                        ri,
                                        wi,
                                        "level",
                                        e.target.value
                                      )
                                    }
                                    className="border px-1 py-0.5 w-16 text-center"
                                  />
                                ) : (
                                  w.level
                                )}
                              </td>
                            </React.Fragment>
                          ))}
                          <td className="border p-2 font-semibold">
                            {r.total}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border p-2 text-left">Grand Total</td>
                        <td className="border p-2 text-center" colSpan={8}>
                          {grandTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

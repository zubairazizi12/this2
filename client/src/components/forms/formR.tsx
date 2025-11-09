import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WeekData = {
  level: string;
  cases: string;
};

type CompetencyRow = {
  id: number;
  text: string;
  week1: WeekData;
  week2: WeekData;
  week3: WeekData;
  week4: WeekData;
  totalCases: string;
};

type FormData = {
  trainerId?: string;
  academicYear: string; // 👈 اضافه شد
  from: string;
  to: string;
  dateBaseCodeNo: string;
  name: string;
  fatherName: string;
  department: string;
  pgy: string;
  rotationType: string;
  rotationName: string;
  rows: CompetencyRow[];
  date: string;
  headOfDeptSignature: string;
  programDirectorSignature: string;
  hospitalDirectorSignature: string;
};

interface RotationProps {
  trainerIdProp?: string;
}

const COMPETENCIES = [
  "Describe basics of radiographic and magnetic resonance imaging techniques and indications",
  "Describe indications and approaches for radiographic and MR imaging techniques in ophthalmology",
  "Detailed interpretation of skull & orbit radiographs",
  "Interpretation of chest radiographs",
  "Interpretation of limbs and spine radiographs",
  "Detailed interpretation of brain & orbit CT simple radiographs and with contrast enhancement techniques",
  "Interpretation of brain MRI in different techniques (e.g. Gadolinium, fat suppression technique and FLAIR)",
  "Conducting and interpretation of MRA (Magnetic resonance Angiography) for eye diseases",
];

export default function RotationForm({ trainerIdProp }: RotationProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    trainerId: trainerIdProp,
    academicYear: "", // 👈 اضافه شد
    from: "Noor eye hospital",
    to: "Ibni Siena",
    dateBaseCodeNo: "",
    name: "",
    fatherName: "",
    department: "Radiology",
    pgy: "",
    rotationType: "Inter/intra departmental rotations",
    rotationName: "",
    date: "",
    headOfDeptSignature: "",
    programDirectorSignature: "",
    hospitalDirectorSignature: "",
    rows: COMPETENCIES.map((text, idx) => ({
      id: idx + 1,
      text,
      week1: { level: "", cases: "" },
      week2: { level: "", cases: "" },
      week3: { level: "", cases: "" },
      week4: { level: "", cases: "" },
      totalCases: "",
    })),
  });

  const fetchTrainerInfo = async (trainerId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/trainerProgress/${trainerId}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "خطا در دریافت ترینر");

      // 👇 مقدار academicYear را از سرور بگیر و در formData ذخیره کن
      setFormData((prev) => ({
        ...prev,
        academicYear: data.currentTrainingYear || "", // اگر نبود، خالی بماند
        name: data.name || "",
        department: data.department || prev.department,
      }));
    } catch (error) {
      console.error("خطا در دریافت سال آموزشی:", error);
      toast({
        title: "❌ خطا در دریافت اطلاعات ترینر",
        description: "اطلاعات سال آموزشی از سرور دریافت نشد",
      });
    }
  };

  useEffect(() => {
    if (!trainerIdProp) {
      toast({
        title: "⚠️ خطا",
        description: "هیچ ترینر فعالی یافت نشد!",
      });
    } else {
      setFormData((prev) => ({ ...prev, trainerId: trainerIdProp }));
      fetchTrainerInfo(trainerIdProp); // 👈 سال آموزشی را از دیتابیس بگیر
    }
  }, [trainerIdProp]);

  // ✅ تابع ولیدیشن
  const validateForm = (): boolean => {
    const requiredFields = [
      { key: "to", label: "قسمت (To)" },
      { key: "dateBaseCodeNo", label: "Date Base Code No" },
      { key: "name", label: "Name" },
      { key: "fatherName", label: "Father Name" },
      { key: "department", label: "Department" },
      { key: "pgy", label: "PGY" },
      { key: "rotationName", label: "Rotation Name" },
    ];

    for (const field of requiredFields) {
      const value = (formData as any)[field.key];
      if (!value || value.trim() === "") {
        toast({
          title: "⚠️ فیلد الزامی",
          description: `لطفاً فیلد "${field.label}" را پر کنید.`,
        });
        return false;
      }
    }

    if (!formData.trainerId) {
      toast({
        title: "⚠️ خطا",
        description: "Trainer ID مشخص نشده است.",
      });
      return false;
    }

    const hasData = formData.rows.some((row) =>
      [row.week1, row.week2, row.week3, row.week4].some(
        (w) => w.level.trim() !== "" || w.cases.trim() !== ""
      )
    );

    if (!hasData) {
      toast({
        title: "⚠️ داده ناقص",
        description: "حداقل در یکی از هفته‌ها باید Level یا Cases وارد شود.",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // ✅ بررسی ولیدیشن قبل از ارسال
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/rotation-form-r`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ موفقیت‌آمیز",
          description: "فرم با موفقیت ذخیره شد",
        });
        console.log("Saved:", result);
      } else {
        toast({
          title: "❌ خطا در ذخیره",
          description: result.message || "Server error",
        });
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "❌ خطای شبکه",
        description: "اتصال به سرور برقرار نشد",
      });
    }
  };

  const updateRow = (
    index: number,
    week: string,
    field: string,
    value: string
  ) => {
    const newRows = [...formData.rows];
    if (week === "total") {
      newRows[index].totalCases = value;
    } else {
      (newRows[index] as any)[week][field] = value;
    }
    setFormData({ ...formData, rows: newRows });
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-4 flex gap-2 justify-start print:hidden">
          <Button
            onClick={handleSave}
            variant="default"
            data-testid="button-save"
          >
            <Save className="mr-2 h-4 w-4" />
            ذخیره
          </Button>
        </div>

        <div
          className="bg-white dark:bg-card border-2 border-foreground/80 shadow-sm p-1 print:shadow-none"
          style={{ direction: "ltr" }}
        >
          {/* ⚡ Academic Year (از دیتابیس) */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-[25%] border-r-2 border-foreground/80 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">Academic Year (</span>
              <Input
                value={formData.academicYear}
                readOnly
                className="h-6 border-0 p-1 text-xs flex-1 bg-muted focus-visible:ring-0"
                data-testid="input-academic-year"
              />
              <span className="font-bold text-sm">)</span>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Header Row 1 */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-[25%] border-r-2 border-foreground/80 p-2">
              <span className="font-bold text-sm">Rotation Form:</span>
            </div>
            <div className="w-[20%] border-r-2 border-foreground/80 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">From :</span>
              <span className="text-sm flex-1 text-center">
                {formData.from}
              </span>
            </div>
            <div className="w-[20%] border-r-2 border-foreground/80 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">To :</span>
              <Input
                value={formData.to}
                onChange={(e) =>
                  setFormData({ ...formData, to: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs focus-visible:ring-0"
                data-testid="input-to"
              />
            </div>
            <div className="flex-1 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">Date Base Code No (</span>
              <Input
                value={formData.dateBaseCodeNo}
                onChange={(e) =>
                  setFormData({ ...formData, dateBaseCodeNo: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs flex-1 focus-visible:ring-0"
                data-testid="input-code"
              />
              <span className="font-bold text-sm">)</span>
            </div>
          </div>

          {/* Header Row 2 */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-[20%] border-r-2 border-foreground/80 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">Name (</span>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs flex-1 focus-visible:ring-0"
                data-testid="input-name"
              />
              <span className="font-bold text-sm">)</span>
            </div>
            <div className="w-[20%] border-r-2 border-foreground/80 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">F/Name (</span>
              <Input
                value={formData.fatherName}
                onChange={(e) =>
                  setFormData({ ...formData, fatherName: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs flex-1 focus-visible:ring-0"
                data-testid="input-father"
              />
              <span className="font-bold text-sm">)</span>
            </div>
            <div className="flex-1 p-2 flex items-center gap-1">
              <span className="font-bold text-sm">Department (</span>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs flex-1 focus-visible:ring-0"
                data-testid="input-department"
              />
              <span className="font-bold text-sm">)</span>
            </div>
          </div>

          {/* Rotation Type Row */}
          <div className="border-b-2 border-foreground/80 p-2 text-center">
            <span className="font-bold text-sm">{formData.rotationType}</span>
          </div>

          {/* Main Table Header */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-[25%] border-r-2 border-foreground/80 p-2 flex items-center justify-center">
              <span className="font-bold text-sm">
                Rotation Competencies PGY (
              </span>
              <Input
                value={formData.pgy}
                onChange={(e) =>
                  setFormData({ ...formData, pgy: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs w-12 text-center focus-visible:ring-0"
                data-testid="input-pgy"
              />
              <span className="font-bold text-sm">)</span>
            </div>

            {/* Week Headers */}
            <div className="flex-1 flex">
              {["1st week", "2nd week", "3rd week", "4th week"].map(
                (week, idx) => (
                  <div
                    key={week}
                    className="flex-1 border-r-2 border-foreground/80"
                  >
                    <div className="text-center font-bold text-xs p-1 border-b border-foreground/80">
                      {week}
                    </div>
                    <div className="flex">
                      <div className="flex-1 text-center font-bold text-xs p-1 border-r border-foreground/80">
                        Level
                      </div>
                      <div className="flex-1 text-center font-bold text-xs p-1">
                        Cases
                      </div>
                    </div>
                  </div>
                )
              )}
              {/* Total of cases header */}
              <div className="w-24 flex items-center justify-center">
                <span
                  className="font-bold text-xs text-center leading-tight"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  Total of cases
                </span>
              </div>
            </div>
          </div>

          {/* Rotation Name Row */}
          <div className="flex border-b-2 border-foreground/80 bg-muted/20">
            <div className="w-[25%] border-r-2 border-foreground/80 p-2 flex items-center justify-center gap-1">
              <span className="font-bold text-sm">Rotation Name(</span>
              <Input
                value={formData.rotationName}
                onChange={(e) =>
                  setFormData({ ...formData, rotationName: e.target.value })
                }
                className="h-6 border-0 p-1 text-xs flex-1 bg-transparent focus-visible:ring-0"
                data-testid="input-rotation-name"
              />
              <span className="font-bold text-sm">)</span>
            </div>
            <div className="flex-1"></div>
          </div>

          {/* Competency Rows */}
          {formData.rows.map((row, index) => (
            <div
              key={row.id}
              className="flex border-b border-foreground/60 hover-elevate"
            >
              <div className="w-[25%] border-r-2 border-foreground/80 p-2">
                <span className="text-xs leading-tight">
                  <span className="font-semibold">{row.id}-</span>
                  {row.text}
                </span>
              </div>

              {/* Week 1 */}
              <div className="w-[14.25%] flex border-r-2 border-foreground/80">
                <div className="flex-1 border-r border-foreground/60 p-1">
                  <Input
                    value={row.week1.level}
                    onChange={(e) =>
                      updateRow(index, "week1", "level", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w1-level-${index}`}
                  />
                </div>
                <div className="flex-1 p-1">
                  <Input
                    value={row.week1.cases}
                    onChange={(e) =>
                      updateRow(index, "week1", "cases", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w1-cases-${index}`}
                  />
                </div>
              </div>

              {/* Week 2 */}
              <div className="w-[14.25%] flex border-r-2 border-foreground/80">
                <div className="flex-1 border-r border-foreground/60 p-1">
                  <Input
                    value={row.week2.level}
                    onChange={(e) =>
                      updateRow(index, "week2", "level", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w2-level-${index}`}
                  />
                </div>
                <div className="flex-1 p-1">
                  <Input
                    value={row.week2.cases}
                    onChange={(e) =>
                      updateRow(index, "week2", "cases", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w2-cases-${index}`}
                  />
                </div>
              </div>

              {/* Week 3 */}
              <div className="w-[14.25%] flex border-r-2 border-foreground/80">
                <div className="flex-1 border-r border-foreground/60 p-1">
                  <Input
                    value={row.week3.level}
                    onChange={(e) =>
                      updateRow(index, "week3", "level", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w3-level-${index}`}
                  />
                </div>
                <div className="flex-1 p-1">
                  <Input
                    value={row.week3.cases}
                    onChange={(e) =>
                      updateRow(index, "week3", "cases", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w3-cases-${index}`}
                  />
                </div>
              </div>

              {/* Week 4 */}
              <div className="w-[14.25%] flex border-r-2 border-foreground/80">
                <div className="flex-1 border-r border-foreground/60 p-1">
                  <Input
                    value={row.week4.level}
                    onChange={(e) =>
                      updateRow(index, "week4", "level", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w4-level-${index}`}
                  />
                </div>
                <div className="flex-1 p-1">
                  <Input
                    value={row.week4.cases}
                    onChange={(e) =>
                      updateRow(index, "week4", "cases", e.target.value)
                    }
                    className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                    data-testid={`input-w4-cases-${index}`}
                  />
                </div>
              </div>

              {/* Total Cases */}
              <div className="w-24 p-1">
                <Input
                  value={row.totalCases}
                  onChange={(e) =>
                    updateRow(index, "total", "", e.target.value)
                  }
                  className="h-6 border-0 p-1 text-xs text-center focus-visible:ring-0"
                  data-testid={`input-total-${index}`}
                />
              </div>
            </div>
          ))}

          {/* Empty Rows */}
          {[1, 2, 3].map((num) => (
            <div
              key={`empty-${num}`}
              className="flex border-b border-foreground/60"
              style={{ minHeight: "32px" }}
            >
              <div className="w-[25%] border-r-2 border-foreground/80"></div>
              <div className="w-[14.25%] border-r-2 border-foreground/80"></div>
              <div className="w-[14.25%] border-r-2 border-foreground/80"></div>
              <div className="w-[14.25%] border-r-2 border-foreground/80"></div>
              <div className="w-[14.25%] border-r-2 border-foreground/80"></div>
              <div className="w-24"></div>
            </div>
          ))}

          {/* Date Row */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-20 border-r-2 border-foreground/80 p-2">
              <span className="font-bold text-sm">Date</span>
            </div>
            <div className="flex-1 flex">
              {[...Array(11)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 border-r border-foreground/60 p-2 last:border-r-0"
                  style={{ minHeight: "32px" }}
                ></div>
              ))}
            </div>
          </div>

          {/* Head of Department Signature Row */}
          <div className="flex border-b-2 border-foreground/80">
            <div className="w-40 border-r-2 border-foreground/80 p-2">
              <span className="font-bold text-xs">
                Head of Department Signature
              </span>
            </div>
            <div className="flex-1 flex">
              {[...Array(11)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 border-r border-foreground/60 p-2 last:border-r-0"
                  style={{ minHeight: "48px" }}
                ></div>
              ))}
            </div>
          </div>

          {/* Final Signature Row */}
          <div className="flex">
            <div className="flex-1 border-r-2 border-foreground/80 p-3 text-center">
              <span className="font-bold text-sm">
                Head of Department Signature
              </span>
            </div>
            <div className="flex-1 border-r-2 border-foreground/80 p-3 text-center">
              <span className="font-bold text-sm">
                Program Director Signature
              </span>
            </div>
            <div className="flex-1 p-3 text-center">
              <span className="font-bold text-sm">
                Hospital Director Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type RotationRow = {
  number: number;
  topic: string;
  grade: string;
  professorName: string;
  signature: string;
  notes: string;
};

type FormData = {
  academicYear: string; // فیلد جدید
  name: string;
  parentType: string;
  parentName: string;
  department: string;
  trainingYear: string;
  rows: RotationRow[];
};

const staticTopics = [
  "کنفرانس داده شده",
  "اشتراک در دیپور صبحانه",
  "اشتراک در کارهای عملی",
  "اخلاق طبابت",
  "تطبیق کریکولوم",
  "اوسط نمرات",
];
interface persianTotationProps {
  trainerIdProp?: string;
}

export default function PersianRotationForm({
  trainerIdProp,
}: persianTotationProps) {
  const { toast } = useToast();

  // ✅ state های جدید برای سه input
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    academicYear: "",
    name: "",
    parentType: "",
    parentName: "",
    department: "",
    trainingYear: "",

    rows: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      topic: staticTopics[i],
      grade: "",
      professorName: "",
      signature: "",
      notes: "",
    })),
  });

  // ✅ وقتی trainerIdProp آماده شد، trainerId تنظیم می‌شود و داده از دیتابیس گرفته می‌شود
  useEffect(() => {
    if (!trainerIdProp) {
      alert("هیچ ترینر فعالی یافت نشد!");
      return;
    }

    setTrainerId(trainerIdProp);

    const fetchTrainerInfo = async () => {
      if (!trainerIdProp) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/trainers/${trainerIdProp}`
        );
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "خطا در دریافت ترینر");

        const trainer = result.trainer;
        const progress = result.trainerProgress;

        // 👇 پیدا کردن سال فعلی از trainingHistory و گرفتن academicYear
        const currentYearData = progress?.trainingHistory?.find(
          (y: any) => y.yearLabel === progress.currentTrainingYear
        );

        // 👇 داده‌ها را مستقیماً در formData می‌گذاریم
        setFormData((prev) => ({
          ...prev,
          trainingYear: progress.currentTrainingYear || "",
          name: trainer?.name || "",
          parentType: trainer?.parentType || trainer?.lastName || "", // fallback
          parentName: trainer?.parentName || "",
          department: trainer?.department || "",
          academicYear: currentYearData?.academicYear || "", // ✅ اینجا اصلاح شد
        }));
      } catch (err) {
        console.error("خطا در دریافت ترینر:", err);
        alert("خطا در دریافت اطلاعات ترینر ❌");
      }
    };

    fetchTrainerInfo();
  }, [trainerIdProp]);

  const handleSave = async () => {
    if (!trainerId) {
      alert("ابتدا باید یک ترینر ثبت شده انتخاب شود!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/rotation-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, ...formData }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ موفقیت‌آمیز",
          description: "فرم با موفقیت ذخیره شد",
        });
        console.log("Form saved:", result.data);
      } else {
        toast({
          title: "❌ خطا در ذخیره‌سازی",
          description: result.message || "مشکلی پیش آمد",
        });
      }
    } catch (error) {
      toast({
        title: "❌ خطای شبکه",
        description: "ارتباط با سرور برقرار نشد",
      });
      console.error("Network error:", error);
    }
  };

  const updateRow = (
    index: number,
    field: keyof RotationRow,
    value: string
  ) => {
    const newRows = [...formData.rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData({ ...formData, rows: newRows });
  };

  return (
    <div
      className="min-h-screen bg-background p-2 sm:p-4 md:p-8"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex gap-2 justify-end no-print">
          <Button
            onClick={handleSave}
            variant="default"
            data-testid="button-save"
          >
            <Save className="ml-2 h-4 w-4" />
            ذخیره
          </Button>
        </div>

        <div className="bg-white dark:bg-card border border-border rounded-md shadow-sm p-4 sm:p-6 md:p-8 print:shadow-none print:border-2">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              فرم مخصوص درج نمرات سیکل Rotation
            </h1>
            <p className="text-sm sm:text-base text-foreground">
              شفاخانه چشم نور
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                سال:
              </label>
              <Input
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-academic-year"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                اسم ترینی:
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-trainee-name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                ولد:
              </label>
              <Input
                value={formData.parentType}
                onChange={(e) =>
                  setFormData({ ...formData, parentType: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-father-name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                ولدیت:
              </label>
              <Input
                value={formData.parentName}
                onChange={(e) =>
                  setFormData({ ...formData, parentName: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-grandfather-name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                دیپارتمنت:
              </label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-department"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1">
                سال ترینینگ:
              </label>
              <Input
                value={formData.trainingYear}
                onChange={(e) =>
                  setFormData({ ...formData, trainingYear: e.target.value })
                }
                className="text-right h-8 sm:h-9 text-sm"
                data-testid="input-training-year"
              />
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold w-12 sm:w-16">
                    شماره
                  </th>
                  <th className="border border-border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold min-w-[150px]">
                    موضوع کنفرانس
                  </th>
                  <th className="border border-border p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold w-20 sm:w-24">
                    نمره داده شده
                  </th>
                  <th className="border border-border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold w-28 sm:w-32">
                    اسم استاد
                  </th>
                  <th className="border border-border p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold w-28 sm:w-32">
                    امضا استاد
                  </th>
                  <th className="border border-border p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold w-32 sm:w-40">
                    ملاحظات
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.rows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="border border-border p-1 sm:p-2 text-center">
                      <span className="text-sm sm:text-base font-medium">
                        {row.number}
                      </span>
                    </td>
                    <td className="border border-border p-1 sm:p-2">
                      <span className="text-sm sm:text-base text-right block px-1">
                        {row.topic}
                      </span>
                    </td>
                    <td className="border border-border p-1 sm:p-2">
                      <Input
                        value={row.grade}
                        onChange={(e) =>
                          updateRow(index, "grade", e.target.value)
                        }
                        className="border-0 p-1 h-auto text-center focus-visible:ring-0 text-sm sm:text-base"
                        data-testid={`input-grade-${index}`}
                        placeholder="نمره"
                      />
                    </td>
                    <td className="border border-border p-1 sm:p-2">
                      <Input
                        value={row.professorName}
                        onChange={(e) =>
                          updateRow(index, "professorName", e.target.value)
                        }
                        className="border-0 p-1 h-auto text-right focus-visible:ring-0 text-sm sm:text-base"
                        data-testid={`input-professor-${index}`}
                        placeholder="نام استاد"
                      />
                    </td>
                    <td className="border border-border p-1 sm:p-2">
                      <div className="h-6 sm:h-8 flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                        {row.signature || "..."}
                      </div>
                    </td>
                    <td className="border border-border p-1 sm:p-2">
                      <Input
                        value={row.notes}
                        onChange={(e) =>
                          updateRow(index, "notes", e.target.value)
                        }
                        className="border-0 p-1 h-auto text-right focus-visible:ring-0 text-sm sm:text-base"
                        data-testid={`input-notes-${index}`}
                        placeholder="یادداشت"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 p-2 sm:p-3 border border-border rounded-md bg-muted/30">
            <p className="text-xs sm:text-sm italic text-foreground">
              <span className="font-semibold">یادداشت:</span> از ۵٪ نمره داده
              می‌شود
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="border border-border rounded-md p-3 sm:p-4 print:break-inside-avoid">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-6 sm:mb-8 text-center">
                شف دیپارتمنت
              </p>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  امضا
                </p>
              </div>
            </div>
            <div className="border border-border rounded-md p-3 sm:p-4 print:break-inside-avoid">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-6 sm:mb-8 text-center">
                آمر پروگرام ترینینگ
              </p>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  امضا
                </p>
              </div>
            </div>
            <div className="border border-border rounded-md p-3 sm:p-4 print:break-inside-avoid">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-6 sm:mb-8 text-center">
                مهر و امضا ریاست
              </p>
              <div className="border-t border-border pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  امضا و مهر
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

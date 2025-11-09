import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import moment from "moment-jalaali";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TrainerActionsListModal from "@/components/reports/TrainerActionsListModal";
import TrainerRewardPunishmentListModal from "@/components/reports/TrainerRewardPunishmentListModal";

import FormCDetails from "@/components/residents/form-details/formC-detail";
import FormDDetails from "@/components/residents/form-details/formD-detail";
import FormEDetails from "@/components/residents/form-details/formE-detail";
import FormGDetails from "@/components/residents/form-details/formG-detail";
import FormHDetails from "@/components/residents/form-details/formH-detail";
import FormKDetails from "@/components/residents/form-details/formK-detail";
import RotationForm from "@/components/residents/form-details/formI-detail";
import TeacherActivityForm from "@/components/residents/form-details/formJ-detail";
import ChecklistDisplay from "./form-details/formF-detail";
import RotationFormDisplay from "@/components/residents/form-details/formR-detail";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Edit3, Save } from "lucide-react";

// فرم‌ها
const FORM_TYPES = [
  { type: "J", name: "Initial Assessment" },
  { type: "F", name: "Mid-Training Evaluation" },
  { type: "D", name: "Clinical Skills" },
  { type: "I", name: "Research Progress" },
  { type: "G", name: "Communication Skills" },
  { type: "E", name: "Ethics & Professionalism" },
  { type: "C", name: "Case Presentation" },
  { type: "H", name: "Hands-on Procedure" },
  { type: "K", name: "Final Competency" },
  { type: "R", name: "Rotation Feedback" },
];

// سال‌ها
const TRAINING_YEARS = ["سال اول", "سال دوم", "سال سوم", "سال چهارم"];

interface TrainerDetailsProps {
  trainerId: string;
  formId?: string;
  onClose: () => void;
}

export default function TrainerDetails({
  trainerId,
  formId,
  onClose,
}: TrainerDetailsProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("سال اول");
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showRewardPunishmentModal, setShowRewardPunishmentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>({
    trainer: {
      name: "",
      lastName: "",
      parentType: "",
      parentName: "",
      photo: "",
      gender: "",
    },
  });
  const printRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // گرفتن اطلاعات ترینر
  const { data, isLoading, error } = useQuery({
    queryKey: ["trainer", trainerId],
    queryFn: () =>
      fetch(`/api/trainers/${trainerId}`).then((res) => res.json()),
  });

  useEffect(() => {
    if (data?.trainer) {
      setEditableData({ trainer: data.trainer });
    }
  }, [data]);

  // 🔄 Mutation ارتقاء باید قبل از هر return شرطی باشد
  const promoteMutation = useMutation({
    mutationFn: async ({ nextYear }: { nextYear: string }) => {
      const res = await fetch(`/api/trainers/${trainerId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextYear }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ارتقاء انجام نشد");
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "✅ ارتقاء موفقانه انجام شد!");
      queryClient.invalidateQueries({ queryKey: ["trainer", trainerId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "⚠️ ارتقاء انجام نشد، دوباره تلاش کنید.");
    },
  });

  // حالا شرط‌های لود و خطا
  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>⚠️ خطا در دریافت داده‌ها</div>;
  if (!data?.trainer) return <div>ترینر پیدا نشد.</div>;

  const trainer = data.trainer;
  const progress = data.trainerProgress;
  const trainingHistory = progress?.trainingHistory || [];

  const selectedTrainingYear = trainingHistory.find(
    (year: any) => year.yearLabel === selectedYear
  );

  const handleChange = (key: string, value: string) => {
    setEditableData((prev: any) => ({
      ...prev,
      trainer: {
        ...prev.trainer,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // بررسی اینکه آیا داده‌ها تغییر کرده‌اند
      const hasChanges = JSON.stringify(editableData) !== JSON.stringify(data);
      if (!hasChanges) {
        throw new Error("هیچ تغییری برای ذخیره وجود ندارد.");
      }

      const res = await fetch(`/api/trainers/${trainerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableData.trainer),
      });

      if (!res.ok) {
        throw new Error("ویرایش با خطا مواجه شد.");
      }

      const updated = await res.json();
      setEditableData(updated);
      setIsEditing(false);
      alert("ویرایش با موفقیت انجام شد!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "خطایی رخ داده است.");
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>Trainer Info</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: Calibri, sans-serif; color: #333; line-height: 1.5; }
              h2 { text-align: center; margin-bottom: 8px; }
              img { border-radius: 50%; width: 100px; height: 100px; object-fit: cover; display: block; margin: 0 auto 8px; }
              ul { list-style: none; padding: 0; margin: 0; }
              li { margin-bottom: 4px; }
              strong { color: #000; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
              .personal-info, .educational-info { padding-bottom: 12px; border-bottom: 1px solid #ccc; margin-bottom: 12px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const formFId = selectedTrainingYear?.forms?.formF || null;

  // تابع ایمن برای رندر فرم‌ها
  const renderForm = () => {
    if (!selectedTrainingYear?.forms) return null;

    switch (selectedForm) {
      case "C":
        return (
          <FormCDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "D":
        return (
          <FormDDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "E":
        return (
          <FormEDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "F":
        return (
          <ChecklistDisplay
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear} // 👈 سال فعلی
            onClose={() => setSelectedForm(null)}
          />
        );
      case "G":
        return (
          <FormGDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "H":
        return (
          <FormHDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "I":
        return (
          <RotationForm
            trainerId={trainerId}
            formId={formId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "J":
        return (
          <TeacherActivityForm
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "K":
        return (
          <FormKDetails
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      case "R":
        return (
          <RotationFormDisplay
            trainerId={trainerId}
            formId={formFId}
            selectedYear={selectedYear}
            onClose={() => setSelectedForm(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg border border-slate-200 p-6">
      {/* بالای کارت */}
      <div className="flex items-center justify-between mb-4 w-full">
        {/* فرم‌ها */}
        <div className="flex-1 flex justify-center space-x-2 overflow-x-auto mx-4">
          {FORM_TYPES.map((ft) => (
            <Button
              key={ft.type}
              onClick={() => setSelectedForm(ft.type)}
              className={`w-12 h-12 rounded-full text-sm ${
                selectedForm === ft.type
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              title={ft.name}
            >
              {ft.type}
            </Button>
          ))}
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => setShowActionsModal(true)}
          >
            اکشن‌ها
          </Button>
          <Button
            size="sm"
            className="bg-purple-500 text-white hover:bg-purple-600"
            onClick={() => setShowRewardPunishmentModal(true)}
          >
            مجازات/مکافات
          </Button>
        </div>

        {/* دراپ‌داون انتخاب سال */}
        <div className="flex-shrink-0">
          <Select
            value={selectedYear}
            onValueChange={(year) => setSelectedYear(year)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="انتخاب سال" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> چاپ
          </Button>
          {!isEditing ? (
            <Button
              size="sm"
              className="bg-blue-500 text-white hover:bg-yellow-600"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" /> ویرایش
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" /> ذخیره
            </Button>
          )}
        </div>
      </div>

      {/* کارت اطلاعات */}
      <div
        ref={printRef}
        className="bg-gradient-to-br from-white to-slate-50 shadow-inner rounded-2xl p-6 mx-auto max-w-4xl border border-slate-200"
      >
        {/* عکس*/}
        <div className="flex flex-col items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="relative">
            <img
              src={editableData?.trainer?.photo || "/default-avatar.png"}
              alt={`${editableData?.trainer?.name || ""} ${
                editableData?.trainer?.lastName || ""
              }`}
              className="w-28 h-28 rounded-full object-cover border shadow-sm"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">
              {editableData?.trainer?.name || ""}{" "}
              {editableData?.trainer?.lastName || ""}
            </h2>
          </div>
        </div>

        {/* جزئیات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ستون راست - اطلاعات شخصی */}
          <div>
            <h4 className="text-lg font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-1">
              اطلاعات شخصی
            </h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>
                <strong>اسم:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.name
                )}
              </li>
              <li>
                <strong>تخلص:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.lastName
                )}
              </li>
              <li>
                <strong>ولد/بنت</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.parentType}
                    onChange={(e) => handleChange("parentType", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.parentType
                )}
              </li>
              <li>
                <strong>ولدیت:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.parentName}
                    onChange={(e) => handleChange("parentName", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.parentName
                )}
              </li>
              <li>
                <strong>جنسیت:</strong>{" "}
                {isEditing ? (
                  <select
                    value={editableData.trainer.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="border p-1 rounded w-32"
                  >
                    <option value="مرد">مرد</option>
                    <option value="زن">زن</option>
                  </select>
                ) : (
                  editableData.trainer.gender
                )}
              </li>

              <li>
                <strong>تاریخ تولد:</strong>{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={
                      editableData.trainer.birthDate
                        ? moment(
                            editableData.trainer.birthDate,
                            "YYYY-MM-DD"
                          ).format("jYYYY/jMM/jDD")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      // فقط اعداد و / مجاز است
                      if (/^[0-9/]*$/.test(value)) {
                        handleChange("birthDate", value); // هنوز شمسی است
                      }
                    }}
                    onBlur={() => {
                      const persianDate = editableData.trainer.birthDate;
                      if (persianDate && persianDate.length === 10) {
                        const [jy, jm, jd] = persianDate.split("/").map(Number);
                        // تبدیل شمسی به میلادی
                        const gregorianDate = moment
                          .from(`${jy}/${jm}/${jd}`, "fa", "jYYYY/jMM/jDD")
                          .format("YYYY-MM-DD");
                        handleChange("birthDate", gregorianDate);
                      }
                    }}
                    placeholder="مثلاً 1404/07/27"
                    className="border p-1 rounded w-40 text-center"
                    maxLength={10}
                    inputMode="numeric"
                  />
                ) : editableData.trainer.birthDate ? (
                  moment(editableData.trainer.birthDate, "YYYY-MM-DD").format(
                    "jYYYY/jMM/jDD"
                  )
                ) : (
                  "—"
                )}
              </li>
              <li>
                <strong>ولایت:</strong>{" "}
                {isEditing ? (
                  <select
                    value={editableData.trainer.province || ""}
                    onChange={(e) => handleChange("province", e.target.value)}
                    className="mt-1 p-2 border rounded-md"
                  >
                    <option value="">ولایت را انتخاب کنید</option>
                    <option value="کابل">کابل</option>
                    <option value="پروان">پروان</option>
                    <option value="کاپیسا">کاپیسا</option>
                    <option value="پنجشیر">پنجشیر</option>
                    <option value="میدان وردک">میدان وردک</option>
                    <option value="لوگر">لوگر</option>
                    <option value="غزنی">غزنی</option>
                    <option value="پکتیا">پکتیا</option>
                    <option value="پکتیکا">پکتیکا</option>
                    <option value="خوست">خوست</option>
                    <option value="ننگرهار">ننگرهار</option>
                    <option value="لغمان">لغمان</option>
                    <option value="کنر">کنر</option>
                    <option value="نورستان">نورستان</option>
                    <option value="بغلان">بغلان</option>
                    <option value="کندز">کندز</option>
                    <option value="تخار">تخار</option>
                    <option value="بدخشان">بدخشان</option>
                    <option value="سمنگان">سمنگان</option>
                    <option value="بلخ">بلخ</option>
                    <option value="جوزجان">جوزجان</option>
                    <option value="فاریاب">فاریاب</option>
                    <option value="سرپل">سرپل</option>
                    <option value="بامیان">بامیان</option>
                    <option value="دایکندی">دایکندی</option>
                    <option value="هرات">هرات</option>
                    <option value="بادغیس">بادغیس</option>
                    <option value="فراه">فراه</option>
                    <option value="نیمروز">نیمروز</option>
                    <option value="هلمند">هلمند</option>
                    <option value="قندهار">قندهار</option>
                    <option value="زابل">زابل</option>
                    <option value="ارزگان">ارزگان</option>
                    <option value="غور">غور</option>
                  </select>
                ) : (
                  editableData.trainer.province || "-"
                )}
              </li>
              <li>
                <strong>شماره تماس:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.phoneNumber
                )}
              </li>
              <li>
                <strong>شماره واتس اپ:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.whatsappNumber}
                    onChange={(e) =>
                      handleChange("whatsappNumber", e.target.value)
                    }
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.whatsappNumber
                )}
              </li>
              <li>
                <strong>ایمیل آدرس:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.email
                )}
              </li>
              <li>
                <strong>نمبر تذکره:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.idNumber
                )}
              </li>
            </ul>
          </div>

          {/* ستون چپ - اطلاعات آموزشی */}
          <div>
            <h4 className="text-lg font-semibold text-blue-700 mb-3 border-b border-blue-100 pb-1">
              اطلاعات آموزشی
            </h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>
                <strong>آی دی:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.id}
                    onChange={(e) => handleChange("id", e.target.value)}
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.id
                )}
              </li>
              <li>
                <strong>دیپارتمنت:</strong>{" "}
                {isEditing ? (
                  <select
                    value={editableData.trainer.department || ""}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="mt-1 p-2 border rounded-md"
                  >
                    <option value="">دیپارتمنت را انتخاب کنید</option>
                    <option value="شبکیه">شبکیه</option>
                    <option value="اطفال">اطفال</option>
                    <option value="چشم پولیس">چشم پولیس</option>
                    <option value="جراحی پلاستیک">جراحی پلاستیک</option>
                    <option value="قرنیه">قرنیه</option>
                    <option value="گلوکوم">گلوکوم</option>
                    <option value="دیدکم">دیدکم</option>
                    <option value="پبپکم">پبپکم</option>
                    <option value="عمومی">عمومی</option>
                  </select>
                ) : (
                  editableData.trainer.department || "-"
                )}
              </li>

              <li>
                <strong>رشته تخصصی:</strong>{" "}
                {editableData.trainer.specialty || "-"}
              </li>

              <li>
                <strong>شفاخانه:</strong> {editableData.trainer.hospital || "-"}
              </li>

              <li>
                <strong>اسم سوپروایزر:</strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.supervisorName}
                    onChange={(e) =>
                      handleChange("supervisorName", e.target.value)
                    }
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.supervisorName
                )}
              </li>
              <li>
                <strong>تاریخ شمولیت به پروگرام تریننگ:</strong>{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={
                      editableData.trainer.joiningDate
                        ? moment(editableData.trainer.joiningDate).format(
                            "jYYYY/jMM/jDD"
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9/]*$/.test(value)) {
                        handleChange("joiningDate", value);
                      }
                    }}
                    placeholder="مثلاً 1404/07/27"
                    className="border p-1 rounded w-40 text-center"
                    maxLength={10}
                  />
                ) : editableData.trainer.joiningDate ? (
                  moment(editableData.trainer.joiningDate).format(
                    "jYYYY/jMM/jDD"
                  )
                ) : (
                  "—"
                )}
              </li>

              <li>
                <strong>سال تریننگ:</strong> {editableData.trainer.trainingYear}
              </li>

              <li>
                <strong>شماره وکود بست </strong>{" "}
                {isEditing ? (
                  <input
                    value={editableData.trainer.postNumberAndCode}
                    onChange={(e) =>
                      handleChange("postNumberAndCode", e.target.value)
                    }
                    className="border p-1 rounded w-32"
                  />
                ) : (
                  editableData.trainer.postNumberAndCode
                )}
              </li>
              {isEditing ? (
                <li>
                  <label className="flex flex-col">
                    <span className="text-sm">نوع تقرر</span>
                    <select
                      value={editableData.trainer.appointmentType || ""}
                      onChange={(e) =>
                        handleChange("appointmentType", e.target.value)
                      }
                      className="mt-1 p-2 border rounded-md"
                    >
                      <option value="">نوع تقرر را انتخاب کنید</option>
                      <option value="رقابت آزاد">رقابت آزاد</option>
                      <option value="داوطلب">داوطلب</option>
                      <option value="حکمی">حکمی</option>
                      <option value="بست خالی">بست خالی</option>
                    </select>
                  </label>
                </li>
              ) : (
                <li>
                  <strong>نوع تقرر:</strong>{" "}
                  {editableData.trainer.appointmentType || "-"}
                </li>
              )}

              {isEditing ? (
                <li>
                  <label className="flex flex-col">
                    <span className="text-sm">وضعیت فعلی</span>
                    <select
                      value={editableData.trainer.status || ""}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="mt-1 p-2 border rounded-md"
                    >
                      <option value="">وضعیت فعلی را انتخاب کنید</option>
                      <option value="برحال">برحال</option>
                      <option value="خدماتی">خدماتی</option>
                    </select>
                  </label>
                </li>
              ) : (
                <li>
                  <strong>وضعیت فعلی:</strong>{" "}
                  {editableData.trainer.status || "-"}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* فرم‌ها */}
      <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
        <DialogContent className="w-[60%] max-w-none max-h-[90vh] overflow-y-auto mt-10 mx-auto p-4 bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>
              فرم {selectedForm} - {selectedYear}
            </DialogTitle>
          </DialogHeader>

          {renderForm()}
        </DialogContent>
      </Dialog>

        <TrainerActionsListModal
        trainerId={trainerId}
        trainerName={`${trainer.name} ${trainer.lastName}`}
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
      />

      {/* مودال مجازات/مکافات */}
      <TrainerRewardPunishmentListModal
        trainerId={trainerId}
        trainerName={`${trainer.name} ${trainer.lastName}`}
        isOpen={showRewardPunishmentModal}
        onClose={() => setShowRewardPunishmentModal(false)}
      />
    </div>
  );
}

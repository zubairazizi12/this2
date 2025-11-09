import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useTrainer } from "@/context/TrainerContext";

import moment from "moment";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";

type FormValues = {
  id: string;
  name: string;
  lastName: string;
  parentType: "ولد" | "بنت" | string;
  parentName: string;
  gender: "مرد" | "زن" | string;
  province: string;
  department: string;
  specialty: string;
  hospital: string;
  joiningDate: string;
  trainingYear: string;
  academicYear: string; // فیلد جدید
  supervisorName: string;
  birthDate: string;
  idNumber: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  postNumberAndCode: string;
  appointmentType: "رقابت آزاد" | "داوطلب" | "حکمی" | "بست خالی" | string;
  status: "برحال" | "خدماتی" | string;
  photo?: FileList;
};

type TrainerRegistrationFormProps = {
  onClose: () => void;
};

export default function TrainerRegistrationForm({
  onClose,
}: TrainerRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      lastName: "",
      parentType: "",
      parentName: "",
      gender: "",
      province: "",
      department: "",
      specialty: "",
      hospital: "",
      joiningDate: "",
      trainingYear: "",
      academicYear: "",
      supervisorName: "",
      birthDate: "",
      idNumber: "",
      phoneNumber: "",
      whatsappNumber: "",
      email: "",
      postNumberAndCode: "",
      appointmentType: "",
      status: "",
      photo: undefined,
    },
  });

  const { setTrainerId } = useTrainer();

  const onSubmit = async (data: FormValues) => {
    function toEnglishNumber(str: string) {
      return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
    }

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        let finalValue: string | File = value as string;

        // 👇 تبدیل اعداد فارسی به انگلیسی
        if (typeof value === "string") {
          finalValue = toEnglishNumber(value);
        }

        // 👇 اگر تاریخ است، به ISO تبدیل کن
        if (key === "joiningDate" || key === "birthDate") {
          if (finalValue) {
            const date = new Date(finalValue);
            finalValue = date.toISOString(); // Mongoose این را می‌فهمد
          }
        }

        if (key === "photo" && value && (value as FileList).length > 0) {
          formData.append("photo", (value as FileList)[0]);
        } else {
          formData.append(key, finalValue as string);
        }
      });

      const response = await fetch("/api/trainers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("خطا در ثبت فرم: " + (errorData.message || "اطلاعات نادرست"));
        return;
      }

      const savedTrainer = await response.json();
      console.log("Saved trainer:", savedTrainer);

      const trainerId = savedTrainer?.trainer?._id ?? savedTrainer?.trainer?.id;

      if (!trainerId) {
        alert("API آیدی برنگرداند!");
        return;
      }

      setTrainerId(trainerId);
      alert("ترینر با موفقیت ثبت شد!");
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      alert("خطا در ثبت فرم، دوباره تلاش کنید.");
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h1 className="text-2xl font-semibold mb-4 text-center">
          فورم ثبت نام ترینری
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* متن و انتخاب */}
            <label className="flex flex-col">
              <span className="text-sm">ایدی</span>
              <input
                {...register("id", { required: "ایدی لازم است" })}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2"
              />
              {errors.id && (
                <span className="text-red-600 text-sm">
                  {errors.id.message}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm">اسم</span>
              <input
                {...register("name", { required: "اسم لازم است" })}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2"
              />
              {errors.name && (
                <span className="text-red-600 text-sm">
                  {errors.name.message}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm">تخلص</span>
              <input
                {...register("lastName", { required: "تخلص لازم است" })}
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2"
              />
              {errors.lastName && (
                <span className="text-red-600 text-sm">
                  {errors.lastName.message}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm">ولد/بنت</span>
              <input
                {...register("parentType")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">ولدیت</span>
              <input
                {...register("parentName")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">جنسیت</span>
              <select
                {...register("gender")}
                className="mt-1 p-2 border rounded-md"
              >
                <option value="">جنسیت را انتخاب کنید</option>
                <option value="مرد">مرد</option>
                <option value="زن">زن</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm">ولایت</span>
              <select
                {...register("province", { required: "انتخاب ولایت لازم است" })}
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
              {errors.province && (
                <span className="text-red-600 text-sm">
                  {errors.province.message}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm">دیپارتمنت</span>
              <select
                {...register("department", { required: "دیپارتمنت لازم است" })}
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
            </label>

            <label className="flex flex-col">
              <span className="text-sm">رشته تخصصی</span>
              <select
                {...register("specialty", { required: "رشته تخصصی لازم است" })}
                className="mt-1 p-2 border rounded-md"
              >
                <option value="">رشته تخصص را انتخاب کنید</option>
                <option value="چشم">چشم</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm">شفاخانه</span>
              <input
                {...register("hospital")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">تاریخ شمولیت به پروگرام تریننگ</span>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="mt-1 p-2 border rounded-md w-full"
                onChange={(date: DateObject | DateObject[] | null) => {
                  if (date instanceof DateObject) {
                    // 👇 تبدیل شمسی به میلادی (برای ذخیره در دیتابیس)
                    const gregorianDate = date.convert(gregorian);
                    setValue("joiningDate", gregorianDate.format("YYYY-MM-DD"));
                  } else {
                    setValue("joiningDate", "");
                  }
                }}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">سال تریننگ فعلی (صنف)</span>
              <select
                {...register("trainingYear")}
                className="mt-1 p-2 border rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  انتخاب کنید
                </option>
                <option value="سال اول">اول</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm">سال تعلیمی</span>
              <input
                {...register("academicYear", {
                  required: "سال تعلیمی لازم است",
                })}
                placeholder="مثلاً 2025-2026"
                className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-2"
              />
              {errors.academicYear && (
                <span className="text-red-600 text-sm">
                  {errors.academicYear.message}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span className="text-sm">اسم سوپروایزر (ترینر)</span>
              <input
                {...register("supervisorName")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">تاریخ تولد</span>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                inputClass="mt-1 p-2 border rounded-md w-full"
                onChange={(date: DateObject | DateObject[] | null) => {
                  if (date instanceof DateObject) {
                    // 👇 تبدیل شمسی به میلادی (برای ذخیره در دیتابیس)
                    const gregorianDate = date.convert(gregorian);
                    setValue("birthDate", gregorianDate.format("YYYY-MM-DD"));
                  } else {
                    setValue("birthDate", "");
                  }
                }}
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">نمبر تذکره</span>
              <input
                {...register("idNumber")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">شماره تماس</span>
              <input
                {...register("phoneNumber")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">شماره واتسپ</span>
              <input
                {...register("whatsappNumber")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">ایمل آدرس</span>
              <input
                type="email"
                {...register("email")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">شماره و کود بست</span>
              <input
                {...register("postNumberAndCode")}
                className="mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm">نوع تقرر</span>
              <select
                {...register("appointmentType")}
                className="mt-1 p-2 border rounded-md"
              >
                <option value="">نوع تقرر را انتخاب کنید</option>
                <option value="رقابت آزاد">رقابت آزاد</option>
                <option value="داوطلب">داوطلب</option>
                <option value="حکمی">حکمی</option>
                <option value="بست خالی">بست خالی</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm">وضعیت فعلی</span>
              <select
                {...register("status")}
                className="mt-1 p-2 border rounded-md"
              >
                <option value="">وضعیت فعلی را انتخاب کنید</option>
                <option value="برحال">برحال</option>
                <option value="خدماتی">خدماتی</option>
              </select>
            </label>

            {/* فیلد آپلود عکس */}
            <label className="flex flex-col">
              <span className="text-sm">عکس ترینر</span>
              <input
                type="file"
                {...register("photo")}
                accept="image/*"
                className="mt-1 p-2 border rounded-md"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              لغو
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ثبت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

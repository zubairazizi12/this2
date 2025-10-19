import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Teacher } from "@shared/schema";

interface EditTeacherModalProps {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedTeacher: Teacher) => void;
}

export default function EditTeacherModal({ teacher, open, onClose, onSave }: EditTeacherModalProps) {
  const [formValues, setFormValues] = useState<Teacher | null>(teacher);

  // وقتی استاد جدید انتخاب شد، فرم ریست شود
  useEffect(() => {
    setFormValues(teacher);
  }, [teacher]);

  if (!formValues) return null;

  const handleChange = (field: keyof Teacher, value: any) => {
    setFormValues(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formValues) {
      onSave(formValues); // ارسال به والد
      onClose();          // بستن مودال
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD برای input type="date"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-4 rtl:space-x-reverse">
            <Avatar className="h-14 w-14">
              <AvatarImage src={formValues.profileImageUrl || ""} alt={formValues.name} />
              <AvatarFallback>{formValues.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xl font-semibold">ویرایش استاد</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm mt-4">
          <InputItem label="نام" value={formValues.name} onChange={val => handleChange("name", val)} />
          {/* <InputItem label="تخلص" value={formValues.lostname} onChange={val => handleChange("lostname", val)} /> */}
          <InputItem label="نام پدر" value={formValues.fatherName} onChange={val => handleChange("fatherName", val)} />
          <InputItem label="نام پدر کلان" value={formValues.grandfatherName} onChange={val => handleChange("grandfatherName", val)} />
          <InputItem label="رتبه علمی" value={formValues.academicRank} onChange={val => handleChange("academicRank", val)} />
          <InputItem
            label="تاریخ اخذ رتبه"
            type="date"
            value={formatDate(formValues.rankAchievementDate)}
            onChange={val => handleChange("rankAchievementDate", val)}
          />
          <InputItem
            label="تاریخ تقرری مربی"
            type="date"
            value={formatDate(formValues.trainerAppointmentDate)}
            onChange={val => handleChange("trainerAppointmentDate", val)}
          />
          <InputItem label="جنسیت" value={formValues.gender} onChange={val => handleChange("gender", val)} />
          <InputItem label="ولایت" value={formValues.province} onChange={val => handleChange("province", val)} />
          <InputItem label="مضمون" value={formValues.subject} onChange={val => handleChange("subject", val)} />
          <InputItem label="وظیفه / موقف" value={formValues.position} onChange={val => handleChange("position", val)} />
          <InputItem label="شفاخانه" value={formValues.hospital} onChange={val => handleChange("hospital", val)} />
          <InputItem
            label="تاریخ تولد"
            type="date"
            value={formatDate(formValues.dateOfBirth)}
            onChange={val => handleChange("dateOfBirth", val)}
          />
          <InputItem label="نمبر تذکره" value={formValues.idNumber} onChange={val => handleChange("idNumber", val)} />
          <InputItem
            label="تاریخ شروع وظیفه"
            type="date"
            value={formatDate(formValues.dutyStartDate)}
            onChange={val => handleChange("dutyStartDate", val)}
          />
          <InputItem label="شماره تماس" value={formValues.contactInfo} onChange={val => handleChange("contactInfo", val)} />
          <InputItem label="نمبر واتساپ" value={formValues.whatsappNumber} onChange={val => handleChange("whatsappNumber", val)} />
          <InputItem label="ایمیل" value={formValues.emailAddress} onChange={val => handleChange("emailAddress", val)} />
          <InputItem label="کود پوست" value={formValues.postCode} onChange={val => handleChange("postCode", val)} />
          <InputItem label="نوع تقرری" value={formValues.appointmentType} onChange={val => handleChange("appointmentType", val)} />
          {/* <InputItem label="دیپارتمنت" value={formValues.department} onChange={val => handleChange("department", val)} /> */}
          {/* <InputItem label="تجربه کاری" type="number" value={formValues.experience} onChange={val => handleChange("experience", val)} /> */}
          <div className="col-span-2 flex justify-end space-x-2 rtl:space-x-reverse mt-4">
            <Button type="button" variant="outline" onClick={onClose}>بستن</Button>
            <Button type="submit" variant="default">ذخیره</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InputItem({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (val: any) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-500 text-xs">{label}</label>
      <input
        type={type}
        className="border rounded px-2 py-1 text-sm"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

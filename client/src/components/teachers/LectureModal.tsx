import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

// برای تاریخ شمسی
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface LectureModalProps {
  teacher: any;
  open: boolean;
  onClose: () => void;
}

export default function LectureModal({ teacher, open, onClose }: LectureModalProps) {
  const [lecture, setLecture] = useState({
    date: null as any,
    subject: "",
    startTime: "",
    endTime: "",
    room: "",
    notes: "",
    files: [] as File[],
  });

  // تغییرات فرم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLecture({ ...lecture, [e.target.name]: e.target.value });
  };

  // تغییر فایل‌ها
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLecture({ ...lecture, files: Array.from(e.target.files) });
    }
  };

  // تغییر تاریخ شمسی
  const handleDateChange = (date: any) => {
    setLecture({ ...lecture, date });
  };

  const handleSubmit = async () => {
    try {
      // تبدیل تاریخ شمسی به میلادی
      const gregorianDate = lecture.date?.toDate(); // تبدیل به JavaScript Date (میلادی)
      const dateString = gregorianDate ? gregorianDate.toISOString().split('T')[0] : "";
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("teacherId", teacher._id);
      formData.append("date", dateString);
      formData.append("subject", lecture.subject);
      formData.append("startTime", lecture.startTime);
      formData.append("endTime", lecture.endTime);
      formData.append("room", lecture.room);
      formData.append("notes", lecture.notes);
      
      // Add files to FormData
      lecture.files.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post("/api/lectures", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("لکچر موفقانه ثبت شد ✅");
      onClose();
    } catch (error) {
      console.error(error);
      alert("ثبت لکچر ناکام شد ❌");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ثبت لکچر برای {teacher.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* تاریخ شمسی */}
          <div>
            <Label>تاریخ</Label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={lecture.date}
              onChange={handleDateChange}
              inputClass="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <Label>مضمون لکچر</Label>
            <Input name="subject" value={lecture.subject} onChange={handleChange} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>ساعت شروع</Label>
              <Input type="time" name="startTime" value={lecture.startTime} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <Label>ساعت ختم</Label>
              <Input type="time" name="endTime" value={lecture.endTime} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label>صنف / تالار</Label>
            <Input name="room" value={lecture.room} onChange={handleChange} />
          </div>

          {/* <div>
            <Label>توضیحات</Label>
            <Input name="notes" value={lecture.notes} onChange={handleChange} />
          </div> */}

          {/* آپلود فایل */}
          <div>
            <Label>آپلود فایل‌ها</Label>
            <Input type="file" multiple onChange={handleFilesChange} />
            {lecture.files.length > 0 && (
              <ul className="mt-1 text-sm">
                {lecture.files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full mt-2">
            ذخیره لکچر
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

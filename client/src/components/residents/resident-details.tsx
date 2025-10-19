import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TrainerActionsListModal from "@/components/reports/TrainerActionsListModal";
import TrainerRewardPunishmentListModal from "@/components/reports/TrainerRewardPunishmentListModal";
// فرم‌های شما همان قبلی می‌مانند:
import FormCDetails from "@/components/residents/form-details/formC-detail";
import FormDDetails from "@/components/residents/form-details/formD-detail";
import FormEDetails from "@/components/residents/form-details/formE-detail";
import FormGDetails from "@/components/residents/form-details/formG-detail";
import FormHDetails from "@/components/residents/form-details/formH-detail";
import FormKDetails from "@/components/residents/form-details/formK-detail";
import RotationForm from "@/components/residents/form-details/formI-detail";
import TeacherActivityForm from "@/components/residents/form-details/formJ-detail";
import ChecklistDisplay from "./form-details/formF-detail";

// تعریف انواع فرم‌ها
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
];

interface TrainerDetailsProps {
  trainerId: string;
  onClose: () => void;
}

// این همان ResidentDetails ولی برای Trainer
export default function TrainerDetails({
  trainerId,
  onClose,
}: TrainerDetailsProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showRewardPunishmentModal, setShowRewardPunishmentModal] = useState(false);

  // اینجا از API ترینر استفاده می‌کنیم
  const { data: trainer, isLoading } = useQuery({
    queryKey: ["/api/trainers", trainerId],
    queryFn: () => fetch(`/api/trainers/${trainerId}`).then((r) => r.json()),
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (!trainer) return <div>ترینر پیدا نشد.</div>;

  return (
    <div className="relative bg-white rounded-lg shadow-lg border border-slate-200 p-6">
      {/* ردیف بالا: عکس + دکمه فرم‌ها + اکشن‌ها */}
      <div className="flex items-center justify-between mb-4 w-full">
        <div className="flex-shrink-0 w-24 h-24 rounded-full border border-slate-300 overflow-hidden">
          {trainer.profileImageUrl ? (
            <img
              src={
                trainer.photo
                  ? `http://localhost:5000${trainer.photo}`
                  : "/assets/img/default-avatar.png"
              }
              className="w-12 h-12 rounded-full mx-auto"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500">
              عکس
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-center space-x-4 overflow-x-auto mx-4">
          {FORM_TYPES.map((ft) => (
            <Button
              key={ft.type}
              onClick={() => setSelectedForm(ft.type)}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-semibold
                ${
                  selectedForm === ft.type
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-700"
                }
                hover:bg-slate-200 transition`}
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
      </div>

      {/* اطلاعات ترینر */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-4">
        <div>
          <h4 className="font-medium text-slate-900 mb-2">اطلاعات شخصی</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>
              <strong>نام کامل:</strong> {trainer.name} {trainer.lastName}
            </li>
            <li>
              <strong>جنسیت:</strong> {trainer.gender}
            </li>
            <li>
              <strong>شماره تماس:</strong> {trainer.phoneNumber}
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-slate-900 mb-2">اطلاعات آموزشی</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>
              <strong>دیپارتمنت:</strong> {trainer.department}
            </li>
            <li>
              <strong>تاریخ شروع:</strong> {trainer.joiningDate}
            </li>
            <li>
              <strong>سال آموزشی:</strong> {trainer.trainingYear}
            </li>
          </ul>
        </div>
      </div>

      {/* دیالوگ برای فرم */}
      <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
        <DialogContent
          className="w-[60%] max-w-none 
                  max-h-[90vh] overflow-y-auto 
                  mt-10 mx-auto
                  p-4 bg-white rounded-lg"
        >
          <DialogHeader>
            <DialogTitle>جزئیات فرم {selectedForm}</DialogTitle>
          </DialogHeader>

          {selectedForm === "C" && (
            <FormCDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}
          {selectedForm === "I" && <RotationForm trainerId={trainerId} />}
          {selectedForm === "J" && (
            <TeacherActivityForm trainerId={trainerId} />
          )}

          {selectedForm === "F" && <ChecklistDisplay trainerId={trainerId} />}
          {selectedForm === "D" && (
            <FormDDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}
          {selectedForm === "E" && (
            <FormEDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}
          {selectedForm === "G" && (
            <FormGDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}
          {selectedForm === "H" && (
            <FormHDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}

          {selectedForm === "K" && (
            <FormKDetails
              trainerId={trainerId}
              onClose={() => setSelectedForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* مودال اکشن‌ها */}
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

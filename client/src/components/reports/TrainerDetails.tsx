import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FormCDetails from "@/components/residents/form-details/formC-detail";
import FormDDetails from "@/components/residents/form-details/formD-detail";
import FormEDetails from "@/components/residents/form-details/formE-detail";
import FormGDetails from "@/components/residents/form-details/formG-detail";
import FormHDetails from "@/components/residents/form-details/formH-detail";
import FormKDetails from "@/components/residents/form-details/formK-detail";

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

export default function TrainerDetails({
  trainerId,
  onClose,
}: TrainerDetailsProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [showActionsSection, setShowActionsSection] = useState(false);

  const { data: trainer, isLoading, error } = useQuery({
    queryKey: ["trainer", trainerId],
    queryFn: () =>
      fetch(`/api/trainers/${trainerId}`).then((res) => res.json()),
  });

  const { data: actions = [] } = useQuery({
    queryKey: ["trainer-actions", trainerId],
    queryFn: async () => {
      const res = await fetch(`/api/trainer-actions/${trainerId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: rewardPunishments = [] } = useQuery({
    queryKey: ["trainer-reward-punishment", trainerId],
    queryFn: async () => {
      const res = await fetch(`/api/trainer-reward-punishment/${trainerId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا در بارگذاری ترینر</div>;
  if (!trainer) return <div>ترینر پیدا نشد.</div>;

  // دیباگ دیتا
  console.log("Trainer data:", trainer);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="w-[60%] max-w-none max-h-[90vh] overflow-y-auto p-4 bg-white rounded-lg"
      >
        {/* دکمه بستن */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            جزییات ترینر: {trainer.name} {trainer.lastName}
          </DialogTitle>
        </DialogHeader>

        {/* ردیف عکس و فرم‌ها */}
        <div className="flex items-center justify-between mb-4 w-full mt-6">
          <div className="flex-shrink-0 w-24 h-24 rounded-full border border-slate-300 overflow-hidden">
            {trainer.profileImageUrl ? (
              <img
                src={trainer.profileImageUrl}
                alt={`${trainer.name} ${trainer.lastName}`}
                className="w-full h-full object-cover"
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
              className="bg-hospital-green-600 text-white hover:bg-hospital-green-700"
              onClick={() => setShowActionsSection(!showActionsSection)}
            >
              اکشن‌ها و مجازات/مکافات ({actions.length + rewardPunishments.length})
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

        {/* بخش اکشن‌ها و مجازات/مکافات */}
        {showActionsSection && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actions">
                  اکشن‌ها ({actions.length})
                </TabsTrigger>
                <TabsTrigger value="rewards">
                  مجازات/مکافات ({rewardPunishments.length})
                </TabsTrigger>
              </TabsList>

              {/* تب اکشن‌ها */}
              <TabsContent value="actions" className="mt-4">
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    هیچ اکشنی ثبت نشده است
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actions.map((action: any) => (
                      <div
                        key={action._id}
                        className="border rounded-lg p-4 bg-slate-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-slate-600 mb-2">
                              تاریخ:{" "}
                              {new Date(action.createdAt).toLocaleDateString("fa-IR")}
                            </p>
                            <p className="text-base font-medium">{action.description}</p>
                          </div>
                        </div>

                        {action.selectedForms && action.selectedForms.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-300">
                            <p className="text-sm font-semibold text-slate-600 mb-2">
                              فرم‌های مرتبط:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {action.selectedForms.map((formType: string) => {
                                const form = FORM_TYPES.find((f) => f.type === formType);
                                return (
                                  <span
                                    key={formType}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-hospital-green-100 text-hospital-green-800"
                                  >
                                    فرم {formType}
                                    {form && ` - ${form.name}`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {action.files && action.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-300">
                            <p className="text-sm font-semibold text-slate-600 mb-2">
                              فایل‌های پیوست:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {action.files.map((file: any, index: number) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `/api/trainer-actions/download/${file.filename}`;
                                    link.download = file.originalName;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                  {file.originalName}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* تب مجازات/مکافات */}
              <TabsContent value="rewards" className="mt-4">
                {rewardPunishments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    هیچ رکوردی ثبت نشده است
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rewardPunishments.map((record: any) => (
                      <div
                        key={record._id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                          record.type === "reward" 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                record.type === "reward" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {record.type === "reward" ? "مکافات" : "مجازات"}
                              </span>
                              <p className="text-sm text-slate-600">
                                تاریخ: {new Date(record.createdAt).toLocaleDateString("fa-IR")}
                              </p>
                            </div>
                            <p className="text-base font-medium">{record.description}</p>
                          </div>
                        </div>

                        {record.files && record.files.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-300">
                            <p className="text-sm font-semibold text-slate-600 mb-2">
                              فایل‌های پیوست:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {record.files.map((file: any, index: number) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = `/api/trainer-reward-punishment/download/${file.filename}`;
                                    link.download = file.originalName;
                                    link.click();
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                  {file.originalName}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* فرم‌ها */}
        {selectedForm && (
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 mb-2">
              جزئیات فرم {selectedForm}
            </h4>

            {selectedForm === "C" && (
              <FormCDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
            {selectedForm === "D" && (
              <FormDDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
            {selectedForm === "E" && (
              <FormEDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
            {selectedForm === "G" && (
              <FormGDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
            {selectedForm === "H" && (
              <FormHDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
            {selectedForm === "K" && (
              <FormKDetails trainerId={trainerId} onClose={() => setSelectedForm(null)} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

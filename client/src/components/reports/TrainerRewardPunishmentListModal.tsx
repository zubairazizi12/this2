import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TrainerRewardPunishmentListModalProps {
  trainerId: string;
  trainerName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FileInfo {
  filename: string;
  originalName: string;
  path: string;
  size: number;
}

interface TrainerRewardPunishment {
  _id: string;
  trainer: string;
  type: "reward" | "punishment";
  description: string;
  files: FileInfo[];
  createdAt: string;
  updatedAt: string;
}

export default function TrainerRewardPunishmentListModal({
  trainerId,
  trainerName,
  isOpen,
  onClose,
}: TrainerRewardPunishmentListModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<TrainerRewardPunishment[]>({
    queryKey: ["trainer-reward-punishment", trainerId],
    queryFn: async () => {
      const res = await fetch(`/api/trainer-reward-punishment/${trainerId}`);
      if (!res.ok) throw new Error("خطا در دریافت مجازات/مکافات");
      return res.json();
    },
    enabled: isOpen && !!trainerId,
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const res = await fetch(`/api/trainer-reward-punishment/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا در حذف رکورد");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-reward-punishment", trainerId] });
    },
  });

  const handleDelete = (recordId: string) => {
    if (confirm("آیا از حذف این رکورد اطمینان دارید؟")) {
      deleteRecordMutation.mutate(recordId);
    }
  };

  const handleDownload = (filename: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = `/api/trainer-reward-punishment/download/${filename}`;
    link.download = originalName;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            مجازات/مکافات ترینری: {trainerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-green-500 mx-auto"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              هیچ رکوردی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.type === "reward"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {record.type === "reward" ? "مکافات" : "مجازات"}
                        </span>
                        <p className="text-sm text-slate-600">
                          تاریخ:{" "}
                          {new Date(record.createdAt).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <p className="text-base">{record.description}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {record.files && record.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-sm font-semibold text-slate-600 mb-2">
                        فایل‌های پیوست شده:
                      </p>
                      <div className="space-y-2">
                        {record.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span className="text-sm">{file.originalName}</span>
                              <span className="text-xs text-slate-400">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file.filename, file.originalName)}
                              className="text-hospital-green-600 hover:text-hospital-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

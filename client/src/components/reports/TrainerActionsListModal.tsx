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

interface TrainerActionsListModalProps {
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

interface TrainerAction {
  _id: string;
  trainer: string;
  description: string;
  files: FileInfo[];
  createdAt: string;
  updatedAt: string;
}

export default function TrainerActionsListModal({
  trainerId,
  trainerName,
  isOpen,
  onClose,
}: TrainerActionsListModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: actions = [], isLoading } = useQuery<TrainerAction[]>({
    queryKey: ["trainer-actions", trainerId],
    queryFn: async () => {
      const res = await fetch(`/api/trainer-actions/${trainerId}`);
      if (!res.ok) throw new Error("خطا در دریافت اکشن‌ها");
      return res.json();
    },
    enabled: isOpen && !!trainerId,
  });

  const deleteActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const res = await fetch(`/api/trainer-actions/${actionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا در حذف اکشن");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-actions", trainerId] });
    },
  });

  const handleDelete = (actionId: string) => {
    if (confirm("آیا از حذف این اکشن اطمینان دارید؟")) {
      deleteActionMutation.mutate(actionId);
    }
  };

  const handleDownload = (filename: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = `/api/trainer-actions/download/${filename}`;
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
            اکشن‌های ترینری: {trainerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-green-500 mx-auto"></div>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              هیچ اکشنی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action._id}
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-2">
                        تاریخ:{" "}
                        {new Date(action.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                      <p className="text-base">{action.description}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(action._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {action.files && action.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-semibold text-slate-600 mb-2">
                        فایل‌های پیوست شده:
                      </p>
                      <div className="space-y-2">
                        {action.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
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

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Save, Upload, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrainerRewardPunishmentModalProps {
  trainerId: string;
  trainerName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainerRewardPunishmentModal({
  trainerId,
  trainerName,
  isOpen,
  onClose,
}: TrainerRewardPunishmentModalProps) {
  const [type, setType] = useState<"reward" | "punishment">("reward");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const createRecordMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/trainer-reward-punishment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("خطا در ثبت مجازات/مکافات");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-reward-punishment", trainerId] });
      setType("reward");
      setDescription("");
      setSelectedFiles([]);
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      alert("لطفاً توضیحات را وارد کنید");
      return;
    }

    const formData = new FormData();
    formData.append("trainerId", trainerId);
    formData.append("type", type);
    formData.append("description", description.trim());
    
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    createRecordMutation.mutate(formData);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            ثبت مجازات/مکافات برای: {trainerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="type" className="mb-2 block">
              نوع
            </Label>
            <Select value={type} onValueChange={(value: "reward" | "punishment") => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="نوع را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reward">مکافات</SelectItem>
                <SelectItem value="punishment">مجازات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              توضیحات
            </Label>
            <Textarea
              id="description"
              placeholder="توضیحات را وارد کنید..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="files" className="mb-2 block">
              آپلود فایل‌ها (حداکثر 10 فایل)
            </Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-hospital-green-500 transition-colors">
              <input
                type="file"
                id="files"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="files"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm text-slate-600">
                  کلیک کنید یا فایل‌ها را بکشید و رها کنید
                </span>
                <span className="text-xs text-slate-400">
                  حداکثر حجم هر فایل: 10MB
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-600">
                  فایل‌های انتخاب شده:
                </p>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-slate-400">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createRecordMutation.isPending}
            className="w-full bg-hospital-green-600 hover:bg-hospital-green-700"
          >
            <Save className="h-4 w-4 ml-2" />
            {createRecordMutation.isPending ? "در حال ثبت..." : "ثبت"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

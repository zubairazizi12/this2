// components/residents/TrainerDetailsModal.tsx
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TrainerDetails from "./resident-details";

interface TrainerDetailsModalProps {
  trainerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainerDetailsModal({
  trainerId,
  isOpen,
  onClose,
}: TrainerDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          w-[90%] max-w-6xl 
          max-h-[90vh] 
          mt-4 mx-auto
          rounded-xl bg-white 
          overflow-y-auto
          p-0
        "
      >
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-bold">جزئیات ترینر</DialogTitle>
        </DialogHeader>

        {/* محتوای اصلی */}
        <div className="p-6">
          <TrainerDetails trainerId={trainerId} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
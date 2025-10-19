import React, { useState } from "react";
import type { Resident, Form } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Plus, X } from "lucide-react";
import ResidentDetailsModal from "./ResidentDetailsModal";
import FormModal from "@/components/forms/form-modal";

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

interface ResidentCardProps {
  resident: Resident;
}

export default function ResidentCardList({ resident }: ResidentCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectForm = (ft: { type: string; name: string }) => {
    setSelectedForm({
      _id: `new-${ft.type}`,
      formType: ft.type,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      residentId: resident._id,
    });
    setShowDropdown(false);
  };

  return (
    <>
      <div className="grid grid-cols-7 items-center bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition p-3 gap-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
            <img
              src={resident.profileImageUrl ?? "/assets/img/default-avatar.png"}
              alt={resident.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-slate-900 font-semibold">{resident.fullName}</div>
        <div className="text-slate-900">{resident.fullName ?? ""}</div>
        <div className="text-slate-700 text-sm">{resident._id}</div>
        <div className="text-slate-500 text-sm">{resident.department}</div>

        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1 border-slate-300 hover:bg-hospital-green-600 hover:text-white transition-colors"
            onClick={() => setShowDropdown((p) => !p)}
          >
            <Plus className="h-3 w-3" />
            اضافه فرم
          </Button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 w-40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">انتخاب فرم</span>
                <button onClick={() => setShowDropdown(false)} className="text-slate-500 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {FORM_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    onClick={() => handleSelectForm(ft)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-hospital-green-600 hover:text-white font-bold transition"
                    title={ft.name}
                  >
                    {ft.type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowDetails(true)}
            title="جزئیات"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            size="icon"
            variant="outline"
            title="اکشن"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedForm && (
        <FormModal form={selectedForm} onClose={() => setSelectedForm(null)} />
      )}

      {showDetails && (
        <ResidentDetailsModal
          residentId={resident._id}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

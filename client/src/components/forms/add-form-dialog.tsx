import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AddFormDialogProps {
  residentId: string;
  onClose: () => void;
  availableFormTypes: string[];
}

const FORM_TYPES = {
  J: 'Initial Assessment & Orientation',
  F: 'Mid-Training Evaluation',
  D: 'Clinical Skills Assessment',
  I: 'Research & Academic Progress',
  G: 'Communication Skills Review',
  E: 'Ethics & Professionalism',
  C: 'Case Presentation Evaluation',
  H: 'Hands-on Procedure Assessment',
  K: 'Final Competency Evaluation',
};

export default function AddFormDialog({ residentId, onClose, availableFormTypes }: AddFormDialogProps) {
  const [selectedFormType, setSelectedFormType] = useState<string>('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      await apiRequest('POST', '/api/forms', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residents', residentId, 'forms'] });
      toast({
        title: "Success",
        description: "Form created successfully.",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!selectedFormType) {
      toast({
        title: "Error",
        description: "Please select a form type.",
        variant: "destructive",
      });
      return;
    }

    createFormMutation.mutate({
      residentId,
      formType: selectedFormType,
      formData: {},
      status: 'draft',
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-add-form">
        <DialogHeader>
          <DialogTitle data-testid="text-add-form-title">Add New Form</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="formType">Form Type</Label>
            <Select value={selectedFormType} onValueChange={setSelectedFormType}>
              <SelectTrigger data-testid="select-form-type">
                <SelectValue placeholder="Select form type" />
              </SelectTrigger>
              <SelectContent>
                {availableFormTypes.map((formType) => (
                  <SelectItem key={formType} value={formType}>
                    Form {formType} - {FORM_TYPES[formType as keyof typeof FORM_TYPES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-200 mt-6 space-x-3">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-add-form">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createFormMutation.isPending}
            className="bg-hospital-green-600 hover:bg-hospital-green-700"
            data-testid="button-create-form"
          >
            {createFormMutation.isPending ? 'Creating...' : 'Create Form'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

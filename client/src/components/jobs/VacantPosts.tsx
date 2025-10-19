import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Vacancy {
  _id: string;
  name: string;
  count: number;
  date: string;
}

export default function VacantPosts() {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [newVacancy, setNewVacancy] = useState({
    name: "",
    count: 1,
    date: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vacancies
  const { data: vacancies = [], isLoading } = useQuery<Vacancy[]>({
    queryKey: ['/api/vacancies'],
    queryFn: async () => {
      const response = await axios.get('/api/vacancies');
      return response.data;
    },
  });

  // Create vacancy mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; count: number; date: string }) => {
      const response = await axios.post('/api/vacancies', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vacancies'] });
      toast({
        title: "موفق",
        description: "بست جدید با موفقیت اضافه شد",
      });
      setNewVacancy({ name: "", count: 1, date: "" });
      setOpenDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در افزودن بست",
        variant: "destructive",
      });
    },
  });

  // Handle add vacancy
  const handleAddVacancy = () => {
    if (!newVacancy.name || !newVacancy.date) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدها را پر کنید",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newVacancy);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="mr-0 md:mr-64">
        <Header />
        
        <div className="pt-16 md:pt-20 p-4 md:p-6 space-y-4">
          {/* دکمه افزودن بست */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">مدیریت بست‌های خالی</h2>
            {user?.role === "admin" && (
              <Button 
                onClick={() => setOpenDialog(true)}
                className="w-full sm:w-auto bg-hospital-green-600 hover:bg-hospital-green-700"
              >
                <Plus className="ml-2 h-4 w-4" />
                افزودن بست جدید
              </Button>
            )}
          </div>

          {/* جدول نمایش بست‌ها */}
          <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-right font-semibold">شماره</th>
                    <th className="px-3 md:px-4 py-3 text-right font-semibold">نام بست</th>
                    <th className="px-3 md:px-4 py-3 text-right font-semibold">تعداد</th>
                    <th className="px-3 md:px-4 py-3 text-right font-semibold">تاریخ ثبت</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-hospital-green-600 border-t-transparent rounded-full"></div>
                          در حال بارگذاری...
                        </div>
                      </td>
                    </tr>
                  ) : vacancies.length > 0 ? (
                    vacancies.map((v, index) => (
                      <tr
                        key={v._id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-slate-100 transition-colors`}
                      >
                        <td className="px-3 md:px-4 py-3 text-slate-900">{index + 1}</td>
                        <td className="px-3 md:px-4 py-3 text-slate-900 font-medium">{v.name}</td>
                        <td className="px-3 md:px-4 py-3 text-slate-900">{v.count}</td>
                        <td className="px-3 md:px-4 py-3 text-slate-600">{v.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-lg">هیچ بست خالی ثبت نشده است</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* مودال افزودن بست */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>افزودن بست جدید</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>نام بست</Label>
              <Input
                value={newVacancy.name}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, name: e.target.value })
                }
                placeholder="مثلاً استاد، کارشناس IT"
              />
            </div>

            <div>
              <Label>تعداد بست</Label>
              <Input
                type="number"
                value={newVacancy.count}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    count: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>تاریخ ثبت</Label>
              <Input
                type="date"
                value={newVacancy.date}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, date: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button 
                onClick={handleAddVacancy}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "در حال ثبت..." : "ثبت بست"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

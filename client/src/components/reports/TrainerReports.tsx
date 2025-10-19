import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import TrainerDetailsModal from "@/components/residents/ResidentDetailsModal";
import TrainerActionsListModal from "./TrainerActionsListModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Eye, MoreHorizontal } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

type Trainer = {
  _id: string;
  id: string;
  name: string;
  lastName: string;
  department: string;
  profileImageUrl?: string;
};

export default function TrainerReportPage() {
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [selectedActionTrainer, setSelectedActionTrainer] = useState<Trainer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data: trainers = [], isLoading, error } = useQuery<Trainer[]>({
    queryKey: ["/api/trainers"],
    queryFn: async () => {
      const res = await fetch("/api/trainers");
      if (!res.ok) {
        throw new Error("Failed to fetch trainers");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const filteredTrainers = Array.isArray(trainers) ? trainers.filter((trainer) => {
    const fullName = `${trainer.name} ${trainer.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      trainer.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || trainer.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  }) : [];

  const departments = Array.isArray(trainers) ? Array.from(new Set(trainers.map((t) => t.department))) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-semibold">خطا در بارگذاری اطلاعات ترینرها</p>
            <p className="text-red-500 text-sm mt-2">لطفاً بعداً دوباره تلاش کنید</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 top-0 ">
      <Sidebar />

      <div className="p-6">
        {/* Header + Filters (Sticky) */}
        <div className="sticky top-0 z-20  shadow-md border-b border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">گزارش ترینرها</h2>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="جستجو ترینر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-64"
                />
              </div>

              {/* Department filter */}
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="همه بخش‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه بخش‌ها</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg shadow-lg">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-slate-200 text-slate-700 text-[13px]">
              <tr>
                <th className="px-3 py-2 border">تصویر</th>
                <th className="px-3 py-2 border">نام</th>
                <th className="px-3 py-2 border">تخلص</th>
                <th className="px-3 py-2 border">آیدی</th>
                <th className="px-3 py-2 border">دپارتمان</th>
                <th className="px-3 py-2 border">جزئیات</th>
                <th className="px-3 py-2 border">اکشن</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer._id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2 border text-center">
                    <img
                      src={
                        trainer.profileImageUrl ??
                        "/assets/img/default-avatar.png"
                      }
                      className="w-12 h-12 rounded-full mx-auto"
                    />
                  </td>
                  <td className="px-3 py-2 border">{trainer.name}</td>
                  <td className="px-3 py-2 border">{trainer.lastName}</td>
                  <td className="px-3 py-2 border">{trainer.id}</td>
                  <td className="px-3 py-2 border">{trainer.department}</td>

                  {/* جزئیات */}
                  <td className="px-3 py-2 border text-center">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        setSelectedTrainer(trainer._id);
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>

                  {/* اکشن */}
                  <td className="px-3 py-2 border text-center">
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => {
                        setSelectedActionTrainer(trainer);
                        setIsActionsModalOpen(true);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedTrainer && (
          <TrainerDetailsModal
            trainerId={selectedTrainer}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTrainer(null);
            }}
          />
        )}

        {/* Actions Modal */}
        {selectedActionTrainer && (
          <TrainerActionsListModal
            trainerId={selectedActionTrainer._id}
            trainerName={`${selectedActionTrainer.name} ${selectedActionTrainer.lastName}`}
            isOpen={isActionsModalOpen}
            onClose={() => {
              setIsActionsModalOpen(false);
              setSelectedActionTrainer(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Teacher } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, CalendarDays } from "lucide-react";
import ViewTeacherModal from "./ViewTeacherModal";
import LectureModal from "./LectureModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface TeacherTableProps {
  teachers: Teacher[];
  onViewDetails: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
}

export default function TeacherTable({
  teachers,
  onViewDetails,
  onEdit,
  onDelete,
}: TeacherTableProps) {
  const { user } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [openLectureModal, setOpenLectureModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "برحال";
      case "inactive":
        return "منفک";
      default:
        return status;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-slate-200">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3 text-right">عکس</th>
            <th className="px-4 py-3 text-right">نام مکمل</th>
            <th className="px-4 py-3 text-right">بست</th>
            <th className="px-4 py-3 text-right">رتبه علمی</th>
            <th className="px-4 py-3 text-right">مضمون</th>
            <th className="px-4 py-3 text-right">حالت</th>
            <th className="px-4 py-3 text-center">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => (
            <tr
              key={teacher._id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-slate-50"
              } hover:bg-slate-100 transition`}
            >
              <td className="px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={teacher.profileImageUrl || ""}
                    alt={teacher.name}
                  />
                  <AvatarFallback className="bg-hospital-green-100 text-hospital-green-600">
                    {teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </td>

              <td className="px-4 py-3 font-medium text-slate-900">
                {teacher.name} {teacher.lostname}
              </td>

              <td className="px-4 py-3">{teacher.position}</td>
              <td className="px-4 py-3">{teacher.academicRank}</td>
              <td className="px-4 py-3">{teacher.subject}</td>

              <td className="px-4 py-3">
                <Badge className={`text-xs ${getStatusColor(teacher.status)}`}>
                  {getStatusText(teacher.status)}
                </Badge>
              </td>

              <td className="px-4 py-3 flex items-center justify-center gap-2">
                {/* مشاهده جزئیات */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setViewModalOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* ویرایش */}
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(teacher)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {/* بخش لکچر */}
                {user?.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setOpenLectureModal(true);
                    }}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* مودال نمایش جزئیات استاد */}
      {selectedTeacher && viewModalOpen && (
        <ViewTeacherModal
          teacher={selectedTeacher}
          open={viewModalOpen}
          onClose={() => {
            setSelectedTeacher(null);
            setViewModalOpen(false);
          }}
        />
      )}

      {/* مودال لکچر */}
      {selectedTeacher && openLectureModal && (
        <LectureModal
          teacher={selectedTeacher}
          open={openLectureModal}
          onClose={() => setOpenLectureModal(false)}
        />
      )}
    </div>
  );
}

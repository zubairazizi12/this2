import React, { useEffect, useState } from "react";
import TrainerDetails from "./TrainerDetails"; // مسیر دقیق فایل را وارد کنید
import { Button } from "@/components/ui/button";

interface Trainer {
  id: number;
  name: string;
  lastName: string;
  parentType: string;
  parentName: string;
  gender: string;
  province: string;
  department: string;
  specialty: string;
  hospital: string;
  joiningDate: string;
  trainingYear: string;
  supervisorName: string;
  birthDate: string;
  idNumber: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  postNumberAndCode: string;
  appointmentType: string;
  status: string;
}

export default function FormsReport() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trainers")
      .then((res) => res.json())
      .then((data) => setTrainers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">گزارش ترینرها</h2>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">نام</th>
            <th className="border px-2 py-1">تخلص</th>
            <th className="border px-2 py-1">جزییات</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{t.id}</td>
              <td className="border px-2 py-1">{t.name}</td>
              <td className="border px-2 py-1">{t.lastName}</td>
              <td className="border px-2 py-1">
                <Button
                  size="sm"
                  onClick={() => setSelectedTrainerId(String(t.id))}
                >
                  مشاهده جزییات
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* مودال TrainerDetails */}
      {selectedTrainerId && (
        <TrainerDetails
          trainerId={selectedTrainerId}
          onClose={() => setSelectedTrainerId(null)}
        />
      )}
    </div>
  );
}

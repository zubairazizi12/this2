import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserFormDialog from "@/components/forms/UserFormDialog";
import { useAuth } from "@/hooks/useAuth";

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);




  // دریافت کاربران از سرور
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get<User[]>("/api/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // حذف کاربر
  const deleteUser = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟")) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast({ title: "موفقیت", description: "کاربر حذف شد" });
    } catch (err: any) {
      toast({ title: "خطا", description: "حذف کاربر با خطا مواجه شد", variant: "destructive" });
    }
  };

// فیلتر جستجو
const filteredUsers = users.filter(
  (u) =>
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
);


  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsUserDialogOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Sidebar />
      <div className="mr-0 md:mr-64 pt-16 md:pt-20 p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">مدیریت کاربران</h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">مدیریت حساب‌های کاربران سیستم</p>
          </div>
          {user?.role === "admin" && (
            <Button
              onClick={handleAddUser}
              data-testid="button-add-user"
            >
              <Plus className="h-4 w-4 mr-2" />
              افزودن کاربر جدید
            </Button>
          )}
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>لیست کاربران</CardTitle>
            <CardDescription>مجموع {filteredUsers.length} کاربر</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="جستجو بر اساس نام یا ایمیل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hospital-green-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? "هیچ کاربری یافت نشد" : "هنوز کاربری اضافه نشده است"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="border p-2 text-center">نام</th>
                      <th className="border p-2 text-center">ایمیل</th>
                      <th className="border p-2 text-center">نقش</th>
                      <th className="border p-2 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem._id} className="text-center hover:bg-slate-50">
                      <td className="border p-2">{userItem.firstName ?? "-"}</td>
                      <td className="border p-2">{userItem.email ?? "-"}</td>
                      <td className="border p-2">{userItem.role ?? "-"}</td>

                        <td className="border p-2 flex items-center justify-center gap-2">
                          {user?.role === "admin" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(userItem)}
                              >
                                ویرایش
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteUser(userItem._id)}
                              >
                                حذف
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UserFormDialog
        isOpen={isUserDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={fetchUsers}
        editingUser={editingUser}
      />
    </div>
  );
}

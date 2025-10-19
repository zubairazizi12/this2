import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Login successful",
        description: "Welcome to the Hospital Resident Management System",
      });

      // Refresh the page to trigger auth state update
      window.location.reload();
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'viewer') => {
    if (type === 'admin') {
      setUsername("admin@com");
      setPassword("admin123");
    } else {
      setUsername("viewer@com");
      setPassword("Viewer123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-[400px] h-[450px] max-w-md mx-4 ">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-hospital-green-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">سیستم مدیریتی ترینری شفاخانه چشم نور</CardTitle>
          {/* <p className="text-slate-600">ورود به سیستم </p> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">ایمیل</Label>
              <Input 
                id="username"
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-username"
              />
            </div>
            <div>
              <Label htmlFor="password">پسورد</Label>
              <Input
                id="password"
                type="password"
                placeholder="پسورد خود را بنویسید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-hospital-green-600 hover:bg-hospital-green-700"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* <div className="mt-6 pt-4 border-t"> */}
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full mb-3"
              data-testid="button-show-demo"
            >
              {showDemo ? "پنهان" : "نمایش"} اکونت های دیمو
            </Button> */}

            {showDemo && (
              <div className="space-y-2">
                {/* <div className="text-sm text-slate-600 mb-3">
                  استفاده از اکونت دیمو
                </div> */}
                {/* <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fillDemoCredentials('admin')}
                    className="flex-1"
                    data-testid="button-demo-admin"
                  >
                    ادمین
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fillDemoCredentials('viewer')}
                    className="flex-1"
                    data-testid="button-demo-viewer"
                  >
                    ناظر
                  </Button>
                </div> */}
                <div className="text-xs text-slate-500 mt-2">
                  ادمین: دسترسی تمام • ناظر: فقد دیدن سیستم
                </div>
              </div>
            )}
          {/* </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

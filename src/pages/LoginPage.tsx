import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { AuthSession } from "../api/postpilotApi";

interface LoginPageProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onLogin: (credentials: { email: string; password: string }) => Promise<AuthSession | void> | void;
}

export function LoginPage({ errorMessage, isLoading = false, onLogin }: LoginPageProps) {
  return (
    <AuthLayout>
      <Card className="p-6">
        <p className="text-sm font-medium text-postpilot-secondary">PostPilot</p>
        <h1 className="mt-3 text-3xl font-semibold text-postpilot-text">ยินดีต้อนรับกลับมา</h1>
        <p className="mt-3 text-sm leading-6 text-postpilot-secondary">
          เข้าสู่ระบบเพื่อจัดการโพสต์สินค้าและพื้นที่ทำงานของคุณ
        </p>
        <form
          className="mt-8 space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await onLogin({
              email: String(formData.get("email") ?? ""),
              password: String(formData.get("password") ?? ""),
            });
          }}
        >
          <Input
            autoComplete="email"
            disabled={isLoading}
            label="อีเมล"
            name="email"
            placeholder="กรอกอีเมลที่ใช้เข้าสู่ระบบ"
            required
            type="email"
          />
          <Input
            autoComplete="current-password"
            disabled={isLoading}
            label="รหัสผ่าน"
            name="password"
            placeholder="กรอกรหัสผ่าน"
            required
            type="password"
          />
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
              {errorMessage}
            </div>
          ) : null}
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

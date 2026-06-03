import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <AuthLayout>
      <Card className="p-6">
        <p className="text-sm font-medium text-postpilot-secondary">PostPilot</p>
        <h1 className="mt-3 text-3xl font-semibold text-postpilot-text">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-postpilot-secondary">
          Sign in to manage your product posts.
        </p>
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
        >
          <Input autoComplete="email" label="Email" placeholder="admin@postpilot.local" type="email" />
          <Input autoComplete="current-password" label="Password" placeholder="Enter password" type="password" />
          <Button className="w-full" type="submit">
            Sign in
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}

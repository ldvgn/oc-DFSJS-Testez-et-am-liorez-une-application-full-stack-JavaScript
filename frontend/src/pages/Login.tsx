import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useSubmit } from "../hooks/useSubmit";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { FormField } from "../components/FormField";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import { TextLink } from "../components/TextLink";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, submit } = useSubmit("Login failed");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(async () => {
      await authService.login({ email, password });
      navigate("/sessions");
    });
  };

  return (
    <main className="flex-1 justify-items-center content-center py-12 px-4">
      <Card className="max-w-md w-full">
        <h1 className="mb-8 text-center">Login to Yoga Studio</h1>

        {error && <Alert message={error} className="w-full" />}

        <form onSubmit={handleSubmit}>
          <FormField label="Email" htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <TextLink to="/register">Register here</TextLink>
        </p>
      </Card>
    </main>
  );
}

export default Login;

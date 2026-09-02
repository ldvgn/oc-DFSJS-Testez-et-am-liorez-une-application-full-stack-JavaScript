import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useSubmit } from "../hooks/useSubmit";
import { RegisterData } from "../types";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { FormField } from "../components/FormField";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import { TextLink } from "../components/TextLink";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { loading, error, submit } = useSubmit("Registration failed");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(async () => {
      await authService.register(formData);
      navigate("/sessions");
    });
  };

  return (
    <main className="flex-1 justify-items-center content-center py-12 px-4">
      <Card className="max-w-md w-full">
        <h1 className="mb-8 text-center">Register for Yoga Studio</h1>

        {error && <Alert message={error} className="w-full" />}

        <form onSubmit={handleSubmit}>
          <FormField label="First Name" htmlFor="firstName">
            <TextInput
              type="text"
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Last Name" htmlFor="lastName">
            <TextInput
              type="text"
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </FormField>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <TextLink to="/login">Login here</TextLink>
        </p>
      </Card>
    </main>
  );
}

export default Register;

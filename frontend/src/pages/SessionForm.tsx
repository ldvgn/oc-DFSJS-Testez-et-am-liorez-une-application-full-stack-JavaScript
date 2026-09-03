import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/auth.service";
import { Teacher } from "../types";
import { sessionService } from "../services/session.service";
import { useTeachers } from "../hooks/useTeachers";
import { useSession } from "../hooks/useSession";
import { useSubmit } from "../hooks/useSubmit";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { FormField } from "../components/FormField";
import { TextInput } from "../components/TextInput";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";

function SessionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    teacherId: "",
  });

  const { teachers } = useTeachers();
  const { session, error: sessionError } = useSession(Number(id));
  const {
    loading,
    error: saveError,
    submit,
  } = useSubmit("Failed to save session");

  /**
   * Redirects non-admin users.
   */
  useEffect(() => {
    if (!user || !user.admin) navigate("/sessions");
  }, [user, navigate]);

  /**
   * In edit mode, preloads the session into the form.
   */
  useEffect(() => {
    if (!session) return;
    setFormData({
      name: session.name,
      date: new Date(session.date).toISOString().split("T")[0],
      description: session.description,
      teacherId: String(session.teacher.id),
    });
  }, [session]);

  /**
   * Updates a form field.
   *
   * @param e - Change event emitted by an input, select, or textarea.
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Creates or updates the session, then redirects.
   *
   * @param e - Form submit event.
   */
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = { ...formData, teacherId: Number(formData.teacherId) };

    submit(async () => {
      if (isEditMode) {
        await sessionService.update(Number(id), payload);
      } else {
        await sessionService.create(payload);
      }
      navigate("/sessions");
    });
  };

  const error = saveError || sessionError;

  return (
    <main>
      <Card className="max-w-2xl mx-auto">
        <h1 className="mb-8 text-center">
          {isEditMode ? "Edit Session" : "Create New Session"}
        </h1>

        {error && <Alert message={error} className="w-full" />}

        <form onSubmit={handleSubmit}>
          <FormField label="Session Name" htmlFor="name">
            <TextInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Date" htmlFor="date">
            <TextInput
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Teacher" htmlFor="teacher">
            <Select
              id="teacher"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher: Teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
            />
          </FormField>

          <div className="flex space-x-4 mt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Session"
                  : "Create Session"}
            </Button>
            <Button
              onClick={() => navigate("/sessions")}
              className="flex-1"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default SessionForm;

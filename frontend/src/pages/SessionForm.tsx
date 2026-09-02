import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../services/auth.service";
import { Teacher } from "../types";
import { sessionService } from "../services/session.service";
import { useTeachers } from "../hooks/useTeachers";
import { useSession } from "../hooks/useSession";
import { useSubmit } from "../hooks/useSubmit";

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
  const { loading, error: saveError, submit } = useSubmit("Failed to save session");

  /**
   * Redirige les utilisateurs non-admin
   */
  useEffect(() => {
    if (!user || !user.admin) navigate("/sessions");
  }, [user, navigate]);

  /**
   * En mode édition précharge la session dans le formulaire
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
   * Met à jour un champ du formulaire
   *
   * @param e - Évènement de changement émis par un input, select ou textarea.
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
   * Crée ou met à jour la session, puis redirige.
   *
   * @param e - Événement de soumission du formulaire.
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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {isEditMode ? "Edit Session" : "Create New Session"}
          </h1>

          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Session Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Teacher
              </label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher: Teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Session"
                    : "Create Session"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/sessions")}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SessionForm;

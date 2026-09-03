import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useSession } from "../hooks/useSession";
import { Card } from "../components/Card";
import { LinkButton } from "../components/LinkButton";
import { Button } from "../components/Button";
import { LoadingState } from "../components/LoadingState";
import { Alert } from "../components/Alert";
import { DescriptionItem } from "../components/DescriptionItem";
import { SessionMeta } from "../components/SessionMeta";

function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading, error, participate, unparticipate, deleteSession } =
    useSession(Number(id));

  const user = authService.getCurrentUser()!;

  /**
   * Registers the current user for the session, alerting on failure.
   */
  const handleParticipate = async () => {
    try {
      await participate(user.id);
    } catch (_) {
      alert("Failed to join session");
    }
  };

  /**
   * Unregisters the current user from the session, alerting on failure.
   */
  const handleUnparticipate = async () => {
    try {
      await unparticipate(user.id);
    } catch (_) {
      alert("Failed to leave session");
    }
  };

  /**
   * Asks for confirmation, deletes the session, then redirects to the list.
   */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await deleteSession();
      navigate("/sessions");
    } catch (_) {
      alert("Failed to delete session");
    }
  };

  if (loading) return <LoadingState label="Loading session..." />;

  if (error || !session) {
    return <Alert message={error || "Session not found"} />;
  }

  const isParticipating = session.users.includes(user.id);

  return (
    <main>
      <Card className="max-w-3xl mx-auto">
        <h1 className="mb-8">{session.name}</h1>

        <h2 className="mb-2">Details</h2>
        <SessionMeta session={session} longDate className="mb-6" />

        <h2 className="mb-2">Description</h2>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">
          {session.description}
        </p>

        <div className="flex space-x-2">
          {user.admin ? (
            <>
              <LinkButton to={`/sessions/edit/${id}`}>Edit</LinkButton>
              <Button onClick={handleDelete} variant="danger">
                Delete
              </Button>
            </>
          ) : (
            <>
              {isParticipating ? (
                <Button onClick={handleUnparticipate} variant="danger">
                  Leave Session
                </Button>
              ) : (
                <Button onClick={handleParticipate} variant="success">
                  Join Session
                </Button>
              )}
            </>
          )}

          <LinkButton to={`/sessions`} variant="secondary">
            Back to Sessions
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}

export default SessionDetail;

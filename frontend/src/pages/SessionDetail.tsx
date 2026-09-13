import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useSession } from "../hooks/useSession";
import { Card } from "../components/Card";
import { LinkButton } from "../components/LinkButton";
import { Button } from "../components/Button";
import { LoadingState } from "../components/LoadingState";
import { Alert } from "../components/Alert";
import { SessionMeta } from "../components/SessionMeta";
import { logger } from "../utils/logger";
import { notify } from "../utils/notify";

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
    } catch (err) {
      notify.error("Failed to join session");
      logger.error("msg", err, {
        sessionId: session?.id,
        user: `${user.firstName} ${user.lastName} (${user.id})`,
      });
    }
  };

  /**
   * Unregisters the current user from the session, alerting on failure.
   */
  const handleUnparticipate = async () => {
    try {
      await unparticipate(user.id);
    } catch (err) {
      notify.error("Failed to leave session");
      logger.error("msg", err, {
        sessionId: session?.id,
        user: `${user.firstName} ${user.lastName} (${user.id})`,
      });
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
    } catch (err) {
      logger.error("Failed to delete session", err, {
        sessionId: session?.id,
        user: `${user.firstName} ${user.lastName} (${user.id})`,
      });
      notify.error("Failed to delete session");
    }
  };

  if (loading) return <LoadingState label="Loading session..." />;

  if (error || !session) {
    return <Alert message={error || "Session not found"} />;
  }

  const isParticipating = session.participants.some((p) => p.userId === user.id);

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

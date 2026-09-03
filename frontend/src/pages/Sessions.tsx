import { authService } from "../services/auth.service";
import { useSessions } from "../hooks/useSessions";
import { Session } from "../types";
import { LoadingState } from "../components/LoadingState";
import { Alert } from "../components/Alert";
import { LinkButton } from "../components/LinkButton";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { SessionMeta } from "../components/SessionMeta";

function Sessions() {
  const { sessions, loading, error, deleteSession } = useSessions();
  const user = authService.getCurrentUser();

  /**
   * Asks for confirmation then deletes the session, alerting on failure.
   *
   * @param sessionId - Id of the session to delete.
   */
  const handleDelete = async (sessionId: Session["id"]) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await deleteSession(sessionId);
    } catch (_) {
      alert("Failed to delete session");
    }
  };

  if (loading) return <LoadingState label="Loading sessions..." />;

  if (error) return <Alert message={error} />;

  return (
    <main>
      <header className="flex justify-between items-center mb-8">
        <h1>Yoga Sessions</h1>
        {user?.admin && (
          <LinkButton to="/sessions/create">Create Session</LinkButton>
        )}
      </header>

      {sessions.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-600">No sessions available</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: Session) => (
            <li key={session.id}>
              <Card as="article" className="p-6!">
                <h2 className="mb-2">{session.name}</h2>
                <SessionMeta session={session} className="mb-4" />

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {session.description}
                </p>

                <div className="flex space-x-2">
                  <LinkButton
                    to={`/sessions/${session.id}`}
                    className="flex-1 text-center"
                  >
                    View Details
                  </LinkButton>

                  {user?.admin && (
                    <Button
                      onClick={() => handleDelete(session.id)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Sessions;

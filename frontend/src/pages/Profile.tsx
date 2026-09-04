import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useUserInfo } from "../hooks/useUserInfo";
import { useSubmit } from "../hooks/useSubmit";
import { LoadingState } from "../components/LoadingState";
import { Alert } from "../components/Alert";
import { Card } from "../components/Card";
import { DescriptionItem } from "../components/DescriptionItem";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { LinkButton } from "../components/LinkButton";
import { logger } from "../utils/logger";
import { notify } from "../utils/notify";

function Profile() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser()!;
  const isDev = import.meta.env.DEV;

  const { userInfo, loading, error, deleteUser, promoteToAdmin } = useUserInfo(
    user.id,
  );
  const {
    loading: promoteLoading,
    error: promoteError,
    submit,
  } = useSubmit("Failed to promote to admin");

  /**
   * Asks for confirmation, deletes the account, logs the user out, then redirects to the login page.
   */
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteUser();
      authService.logout();
      navigate("/login");
    } catch (err) {
      notify.error("Failed to delete account");
      logger.error("msg", err, {
        user: `${user.firstName} ${user.lastName} (${user.id})`,
      });
    }
  };

  /**
   * Promotes the current user to admin.
   */
  const handlePromoteAdmin = () => submit(promoteToAdmin);

  if (loading) return <LoadingState label="Loading profile..." />;

  if (error || !userInfo) {
    return <Alert message={error || "Failed to load profile"} />;
  }

  return (
    <main>
      <Card className="max-w-3xl mx-auto">
        <h1 className="mb-8">My Profile</h1>
        <dl className="divide-y divide-gray-200 mb-8">
          <DescriptionItem label="First Name">
            {userInfo.firstName}
          </DescriptionItem>
          <DescriptionItem label="Last Name">
            {userInfo.lastName}
          </DescriptionItem>
          <DescriptionItem label="Email">{userInfo.email}</DescriptionItem>
          <DescriptionItem label="Account Type">
            {userInfo.admin ? (
              <Badge variant="purple">Administrator</Badge>
            ) : (
              <Badge variant="blue">User</Badge>
            )}
            {isDev && !userInfo.admin && (
              <div className="mt-3">
                <Button
                  onClick={handlePromoteAdmin}
                  disabled={promoteLoading}
                  className="text-base"
                  variant="success"
                >
                  {promoteLoading ? "Promoting..." : "Promote to Admin (Dev)"}
                </Button>

                {promoteError && (
                  <div className="mt-2 text-sm text-red-600">
                    {promoteError}
                  </div>
                )}
              </div>
            )}
          </DescriptionItem>

          <DescriptionItem label="Member Since">
            {userInfo.createdAt
              ? new Date(userInfo.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </DescriptionItem>
        </dl>

        <div className="flex space-x-2">
          <LinkButton to={`/sessions`} className="flex-1 text-center">
            Back to Sessions
          </LinkButton>
          <Button onClick={handleDeleteAccount} variant="danger">
            Delete Account
          </Button>
        </div>
      </Card>
    </main>
  );
}

export default Profile;

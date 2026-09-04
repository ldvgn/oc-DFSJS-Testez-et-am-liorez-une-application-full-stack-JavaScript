import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { Button } from "./Button";
import { TextLink } from "./TextLink";

function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Yoga Studio
        </Link>

        <ul className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <li>
                <TextLink to="/sessions" variant="inverted">
                  Sessions
                </TextLink>
              </li>
              {user && user.admin && (
                <li>
                  <TextLink to="/sessions/create" variant="inverted">
                    Create Session
                  </TextLink>
                </li>
              )}
              <li>
                <TextLink to="/profile" variant="inverted">
                  Profile
                </TextLink>
              </li>
              <li>
                <Button
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  Logout
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <TextLink to="/login" variant="inverted">
                  Login
                </TextLink>
              </li>
              <li>
                <TextLink to="/register" variant="inverted">
                  Register
                </TextLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

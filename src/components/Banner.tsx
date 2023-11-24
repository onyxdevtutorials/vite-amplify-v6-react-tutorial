import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const currentAuthenticatedUser = async () => {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      console.log("username", username);
      console.log("userId", userId);
      console.log("signInDetails", signInDetails);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("could not sign out", error);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <div>
      {!isAuthenticated && (
        <span>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </span>
      )}

      {isAuthenticated && <button onClick={handleSignOut}>Sign Out</button>}
    </div>
  );
};
export default Banner;

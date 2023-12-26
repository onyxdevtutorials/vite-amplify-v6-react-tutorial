import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useAuthContext } from "../context/AuthContext";

const SignOut = () => {
  const { setIsLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    } catch (error) {
      console.error("could not sign out", error);
    }
  };

  return (
    <Button variant="dark" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};

export default SignOut;

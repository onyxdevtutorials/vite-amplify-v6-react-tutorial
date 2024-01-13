import { AuthError } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useAuthContext } from "../context/AuthContext";

const SignOut = () => {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(navigate);
    } catch (error) {
      const authError = error as AuthError;
      console.error("could not sign out", authError);
    }
  };

  return (
    <Button variant="dark" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};

export default SignOut;

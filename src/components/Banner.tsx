import { getCurrentUser } from "aws-amplify/auth";
import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const Banner = () => {
  const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuthContext();

  const navigate = useNavigate();

  const currentAuthenticatedUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("currentUser", currentUser);
      const { username } = currentUser;
      const { userId } = currentUser;
      const { signInDetails } = currentUser;
      console.log("username", username);
      console.log("userId", userId);
      console.log("signInDetails", signInDetails);
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
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
    <Navbar>
      <Container>
        <Navbar.Brand>Site Name</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {!isLoggedIn && (
            <>
              <Button variant="dark" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button variant="dark" onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          )}

          {isLoggedIn && (
            <>
              {isAdmin && (
                <Nav.Link as={Link} to="/add">
                  Add Product
                </Nav.Link>
              )}
              <Button variant="dark" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Banner;

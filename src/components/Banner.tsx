import { getCurrentUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";

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
    <Navbar>
      <Container>
        <Navbar.Brand>Site Name</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {!isAuthenticated && (
            <>
              <Nav.Link>
                <Button variant="dark" onClick={handleSignIn}>
                  Sign In
                </Button>
              </Nav.Link>
              <Nav.Link>
                <Button variant="dark" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </Nav.Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Nav.Link>
                <Button variant="dark" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </Nav.Link>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Banner;

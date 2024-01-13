import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { SignOut } from "../components/";

const Banner = () => {
  const { isLoggedIn, isAdmin } = useAuthContext();

  const navigate = useNavigate();

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
              <SignOut />
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Banner;

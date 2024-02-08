import { useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const Banner = () => {
  const { isLoggedIn, isAdmin, user, signOut } = useAuthContext();

  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSignOut = async () => {
    await signOut(navigate);
  };

  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          Onyx Store
        </Navbar.Brand>
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
                <Nav.Link as={Link} to="/products/new">
                  Add Product
                </Nav.Link>
              )}
              {user && (
                <Dropdown>
                  <Dropdown.Toggle variant="dark" id="dropdown-basic">
                    {user.username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={`/users/${user.userId}`}>
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/changepassword">
                      Change Password
                    </Dropdown.Item>
                    <Dropdown.Item as={Button} onClick={handleSignOut}>
                      Sign Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default Banner;

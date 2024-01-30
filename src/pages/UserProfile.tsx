import { useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./UserProfile.css";
import useGetUserWithReviews from "../hooks/useGetUserWithReviews";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { userWithReviews, errorMessage, isLoading } =
    useGetUserWithReviews(userId);
  console.log("userWithReviews: ", userWithReviews);
  const { user: signedInUser, isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (!userWithReviews) return <div>{errorMessage}</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title className="profile-title mb-5">User Profile</Card.Title>
        <Row>
          <Col sm="3" className="profile-label">
            Username
          </Col>
          <Col sm="9" className="profile-field">
            {userWithReviews.username}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col sm="3" className="profile-label">
            First Name
          </Col>
          <Col sm="9" className="profile-field">
            {userWithReviews.firstName}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col sm="3" className="profile-label">
            Last Name
          </Col>
          <Col sm="9" className="profile-field">
            {userWithReviews.lastName}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col sm="3" className="profile-label">
            Reviews
          </Col>
          <Col sm="9" className="profile-field">
            {userWithReviews.reviews?.items?.length || "0"}
          </Col>
        </Row>
        {isLoggedIn && signedInUser?.userId === userId && (
          <>
            <hr />
            <Button
              variant="dark"
              onClick={() => navigate(`/users/${userId}/edit`)}
            >
              Edit Profile
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};
export default UserProfile;

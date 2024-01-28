import React from "react";
import { useParams } from "react-router-dom";
import useGetReview from "../hooks/useGetReview";
import { useAuthContext } from "../context/AuthContext";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface ReviewProps {
  reviewId?: string;
}

const Review: React.FC<ReviewProps> = ({ reviewId: propReviewId }) => {
  const navigate = useNavigate();

  // If reviewId is not passed as a prop, try to get it from the route parameters
  const { reviewId: paramReviewId } = useParams<{ reviewId?: string }>();

  // Use the propReviewId if it's defined, otherwise use paramReviewId
  const reviewId = propReviewId ?? paramReviewId;

  // Fetch and display the review using the reviewId...
  const { review, isLoading, errorMessage } = useGetReview(reviewId);

  const { isLoggedIn, user } = useAuthContext();
  const username = user?.username;

  const handleEditReview = () => {
    if (!reviewId) return;

    navigate(`/reviews/${reviewId}/edit`);
  };

  const handleDeleteReview = async () => {
    toast.warn("delete review not yet implemented");
  };

  return (
    <div>
      {isLoading && <p>Loading review...</p>}
      {errorMessage && <p>{errorMessage}</p>}
      {review && (
        <Card key={review.id}>
          <Card.Body>
            <Card.Title className="mb-2 text-muted">
              {review.rating} stars
            </Card.Title>
            <Card.Text>{review.content}</Card.Text>
            <Card.Subtitle className="mb-2 text-muted">
              Reviewed by {review.owner}
            </Card.Subtitle>
            {isLoggedIn && username === review.owner && (
              <>
                <Button variant="primary" onClick={handleEditReview}>
                  Edit
                </Button>
                <Button variant="primary" onClick={handleDeleteReview}>
                  Delete
                </Button>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Review;

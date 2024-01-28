import { useState, useEffect } from "react";
import { getReview } from "../graphql/queries";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { GetReviewQuery } from "../API";
import { useAuthContext } from "../context/AuthContext";
import { GraphQLError } from "graphql";

const client = generateClient();

const useGetReview = (reviewId: string | undefined) => {
  const [review, setReview] = useState<GetReviewQuery["getReview"]>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    const fetchReview = async () => {
      if (!reviewId) {
        setErrorMessage("No review ID provided");
        setIsLoading(false);
        console.error("no review id provided");
        return;
      }

      try {
        setIsLoading(true);
        const result = (await client.graphql({
          query: getReview,
          variables: { id: reviewId },
          authMode: isLoggedIn ? "userPool" : "iam",
        })) as GraphQLResult<GetReviewQuery>;

        if (result.data?.getReview) {
          setReview(result.data.getReview);
        } else {
          setErrorMessage("Failed to fetch review");
        }
      } catch (error) {
        const graphQLError = error as GraphQLError;
        setErrorMessage(graphQLError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [reviewId, isLoggedIn]);

  return { review, errorMessage, isLoading };
};

export default useGetReview;

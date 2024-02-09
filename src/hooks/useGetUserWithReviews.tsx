import { useState, useEffect } from "react";
import { GetUserWithReviewsQuery } from "../API";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { getUserWithReviews } from "../graphql/customQueries";
import { useAuthContext } from "../context/AuthContext";
import { GraphQLError } from "graphql";

const useGetUserWithReviews = (userId: string | undefined) => {
  const [userWithReviews, setUserWithReviews] =
    useState<GetUserWithReviewsQuery["getUser"]>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    const fetchUserWithReviews = async () => {
      if (!userId) {
        console.error("no user id provided");
        setErrorMessage("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = (await generateClient().graphql({
          query: getUserWithReviews,
          variables: { id: userId },
          authMode: isLoggedIn ? "userPool" : "iam",
        })) as GraphQLResult<GetUserWithReviewsQuery>;

        const userWithReviewsData = result.data?.getUser;
        if (!userWithReviewsData || result.errors) {
          setErrorMessage("Could not get user with ID: " + userId);
          return;
        }
        setUserWithReviews(userWithReviewsData);
      } catch (err) {
        const graphQLError = err as GraphQLError;
        console.error("error fetching user: ", graphQLError.message);
        setErrorMessage(
          `Error fetching user with ID ${userId}: ${graphQLError.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserWithReviews();
  }, [userId, isLoggedIn]);

  return { userWithReviews, errorMessage, isLoading };
};
export default useGetUserWithReviews;

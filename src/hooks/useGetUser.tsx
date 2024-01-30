import { useState, useEffect } from "react";
import type { User, GetUserQuery } from "../API";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { getUser } from "../graphql/queries";
import { useAuthContext } from "../context/AuthContext";

const client = generateClient();

const useGetUser = (userId: string | undefined) => {
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error("no user id provided");
        setErrorMessage("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = (await client.graphql({
          query: getUser,
          variables: { id: userId },
          authMode: isLoggedIn ? "userPool" : "iam",
        })) as GraphQLResult<GetUserQuery>;

        const userData = result.data?.getUser as User;
        console.log("userData: ", userData);
        if (!userData || result.errors) {
          setErrorMessage("Could not get user with ID: " + userId);
          return;
        }
        setUser(userData);
      } catch (err) {
        console.error("error fetching user: ", err);
        setErrorMessage("Error fetching user with ID: " + userId);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId, isLoggedIn]);

  return { user, errorMessage, isLoading };
};
export default useGetUser;

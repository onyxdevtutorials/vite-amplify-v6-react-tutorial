import { useState } from "react";
import { AuthError, fetchAuthSession } from "aws-amplify/auth";

const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIsAdmin = async () => {
    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error(`Error checking admin status: ${authError.message}`);
    }
  };

  return { isAdmin, checkIsAdmin };
};

export default useIsAdmin;

import { useEffect, useState, useCallback } from "react";
import { AuthError, fetchAuthSession } from "aws-amplify/auth";

const useIsAdmin = () => {
  const initialIsAdmin = localStorage.getItem("isAdmin") === "true";
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  const checkIsAdmin = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          setIsAdmin(true);
          localStorage.setItem("isAdmin", "true");
        } else {
          setIsAdmin(false);
          localStorage.setItem("isAdmin", "false");
        }
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error(`Error checking admin status: ${authError.message}`);
    }
  }, []);

  useEffect(() => {
    checkIsAdmin();
  }, [checkIsAdmin]);

  return { isAdmin, checkIsAdmin };
};

export default useIsAdmin;

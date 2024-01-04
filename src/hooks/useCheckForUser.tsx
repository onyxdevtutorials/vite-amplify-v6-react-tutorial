import { useState, useEffect, useCallback } from "react";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";

const useCheckForUser = () => {
  const initialIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setIsLoggedIn(true);
      setUser(currentUser);
      localStorage.setItem("isLoggedIn", "true");
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.setItem("isLoggedIn", "false");
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return { isLoggedIn, user, checkUser };
};

export default useCheckForUser;

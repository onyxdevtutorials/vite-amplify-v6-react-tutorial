import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "aws-amplify/auth";

const useCheckForUser = () => {
  const initialIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  const checkUser = useCallback(async () => {
    try {
      await getCurrentUser();
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return { isLoggedIn, checkUser };
};

export default useCheckForUser;

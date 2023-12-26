import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import { signIn, SignInInput, AuthError } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";
import useIsAdmin from "../hooks/useIsAdmin";

const initialState = { username: "", password: "" };

const validationSchema = yup.object().shape({
  username: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const SignIn = () => {
  const [signInError, setSignInError] = useState("");
  const navigate = useNavigate();
  const initialValues: SignInInput = initialState;

  const { setIsLoggedIn, setIsAdmin } = useAuthContext();
  const { signInStep, setSignInStep } = useSignInContext();

  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    const checkIsAdmin = async () => {
      setIsAdmin(isAdmin);
    };

    checkIsAdmin();
  }, [setIsAdmin, isAdmin]);

  const onSubmit = async (values: SignInInput) => {
    const { username, password } = values;

    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });

      setSignInStep(nextStep.signInStep);
      setIsLoggedIn(isSignedIn);
      if (isSignedIn) {
        localStorage.setItem("isLoggedIn", "true");
      }
      if (nextStep.signInStep === "DONE") {
        navigate("/");
      }
    } catch (error) {
      // NotAuthorizedException: Incorrect username or password.
      const authError = error as AuthError;
      setIsLoggedIn(false);
      setSignInError(
        `There was a problem signing you in: ${authError.message}`
      );
      console.error("error signing in", error);
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: onSubmit,
  });

  if (signInStep === "") {
    return (
      <>
        <Form onSubmit={handleSubmit} noValidate className="sign-in-form">
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.username && !!errors.username}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.password && !!errors.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <div>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Sign In
            </Button>
          </div>
        </Form>

        {signInError && (
          <Alert variant="warning">
            <p>{signInError}</p>
          </Alert>
        )}
      </>
    );
  }

  if (signInStep === "DONE") {
    return (
      <Alert variant="success">
        <p>Successfully signed in.</p>
      </Alert>
    );
  }
};
export default SignIn;

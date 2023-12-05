import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { signIn, SignInInput, fetchAuthSession } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";

const initialState = { username: "", password: "" };

const SignIn = () => {
  const [signInError, setSignInError] = useState("");
  const navigate = useNavigate();
  const initialValues: SignInInput = initialState;

  const { setIsLoggedIn, setIsAdmin } = useAuthContext();
  const { signInStep, setSignInStep } = useSignInContext();

  const validationSchema = yup.object().shape({
    username: yup.string().required("Required"),
    password: yup.string().required("Required"),
  });

  const onSubmit = async (values: SignInInput) => {
    const { username, password } = values;

    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      const authSession = await fetchAuthSession();
      const tokens = authSession.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        // groups is undefined if user belongs to no groups.
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          setIsAdmin(true);
        }
      }

      setSignInStep(nextStep.signInStep);
      setIsLoggedIn(isSignedIn);
      if (nextStep.signInStep === "DONE") {
        navigate("/");
      }
    } catch (error) {
      // NotAuthorizedException: Incorrect username or password.
      setIsLoggedIn(false);
      setSignInError("There was a problem signing you in.");
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
        <Form onSubmit={handleSubmit} noValidate>
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

        {signInError && <p>{signInError}</p>}
      </>
    );
  }

  if (signInStep === "DONE") {
    return <div>Successfully signed in.</div>;
  }
};
export default SignIn;

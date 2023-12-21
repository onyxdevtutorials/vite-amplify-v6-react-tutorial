import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import {
  AuthError,
  confirmSignIn,
  ConfirmSignInInput,
  fetchAuthSession,
} from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";

const validationSchema = yup.object().shape({
  challengeResponse: yup.string().required("Required"),
});

const SignInConfirm = () => {
  const [signInConfirmError, setSignInConfirmError] = useState("");
  const navigate = useNavigate();
  const initialValues: ConfirmSignInInput = { challengeResponse: "" };

  const { setIsLoggedIn, setIsAdmin } = useAuthContext();
  const { setSignInStep, signInStep } = useSignInContext();

  const onSubmit = async (values: ConfirmSignInInput) => {
    const { challengeResponse } = values;

    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: challengeResponse,
      });
      setIsLoggedIn(isSignedIn);
      setSignInStep(nextStep.signInStep);
      const authSession = await fetchAuthSession();
      const tokens = authSession.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        console.log("groups", groups);
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          setIsAdmin(true);
        }
      }
      if (nextStep.signInStep === "DONE") {
        navigate("/");
      }
    } catch (error) {
      const authError = error as AuthError;
      setSignInConfirmError(
        `There was a problem confirming your sign in: ${authError.message}`
      );
      console.error("error", error);
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

  if (signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
    return (
      <>
        <h2>Please Set a New Password</h2>
        <Form
          onSubmit={handleSubmit}
          noValidate
          className="sign-in-confirm-form"
        >
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="challengeResponse"
              placeholder="Password"
              value={values.challengeResponse}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={
                touched.challengeResponse && !!errors.challengeResponse
              }
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.challengeResponse}
            </Form.Control.Feedback>
          </Form.Group>
          <div>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Change Password
            </Button>
          </div>
        </Form>
        {signInConfirmError && (
          <Alert variant="warning">{signInConfirmError}</Alert>
        )}
      </>
    );
  }

  if (signInStep === "DONE") {
    return <Alert variant="success">Successfully signed in.</Alert>;
  }
};
export default SignInConfirm;

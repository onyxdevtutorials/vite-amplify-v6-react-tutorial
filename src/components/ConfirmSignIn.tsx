import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {
  confirmSignIn,
  ConfirmSignInInput,
  fetchAuthSession,
} from "aws-amplify/auth";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";

type Actions = {
  resetForm: () => void;
};

const validationSchema = yup.object().shape({
  challengeResponse: yup.string().required("Required"),
});

const ConfirmSignIn = () => {
  const initialValues: ConfirmSignInInput = { challengeResponse: "" };

  const { setIsLoggedIn, setIsAdmin } = useAuthContext();
  const { setSignInStep, signInStep } = useSignInContext();

  const onSubmit = async (values: ConfirmSignInInput, actions: Actions) => {
    const { challengeResponse } = values;
    console.log("values", values);
    console.log("actions", actions);

    try {
      const confirmSignInResult = await confirmSignIn({
        challengeResponse: challengeResponse,
      });
      console.log("confirmSignInResult", confirmSignInResult);
      const { isSignedIn, nextStep } = confirmSignInResult;
      const signInStep = nextStep.signInStep;
      setIsLoggedIn(isSignedIn);
      setSignInStep(signInStep);
      const authSession = await fetchAuthSession();
      const tokens = authSession.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        console.log("groups", groups);
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
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
      <div>
        <h2>Please Set a New Password</h2>
        <Form onSubmit={handleSubmit} noValidate>
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
      </div>
    );
  }

  if (signInStep === "DONE") {
    return <div>Successfully signed in.</div>;
  }
};
export default ConfirmSignIn;

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {
  confirmSignUp,
  fetchAuthSession,
  signUp,
  ConfirmSignUpInput,
} from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSignUpContext } from "../context/SignUpContext";

type Actions = {
  resetForm: () => void;
};

const validationSchema = yup.object().shape({
  confirmationCode: yup.string().required("Required"),
});

const SignUpConfirm = () => {
  const { signUpStep, setSignUpStep, username } = useSignUpContext();

  const navigate = useNavigate();

  const initialValues: ConfirmSignUpInput = {
    username: username,
    confirmationCode: "",
  };

  const onSubmit = async (values: ConfirmSignUpInput, actions: Actions) => {
    try {
      //   const authSession = await fetchAuthSession();
      //   const tokens = authSession.tokens;
      //   let username;
      //   console.log("values", values);
      //   if (tokens && Object.keys(tokens).length > 0) {
      //     username = tokens.accessToken.payload.username;
      //     console.log("username", username);
      //   }

      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: username,
        confirmationCode: values.confirmationCode,
      });
      console.log("isSignUpComplete", isSignUpComplete);
      console.log("nextStep", nextStep);

      setSignUpStep(nextStep.signUpStep);

      //   if (isSignUpComplete) {
      //     // navigate("/");
      //     const authSession = await fetchAuthSession();
      //     console.log("authSession", authSession);
      //   }

      // COMPLETE_AUTO_SIGN_IN?
      navigate("/signin");
    } catch (error) {
      console.error("error confirming sign up", error);
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

  if (signUpStep === "CONFIRM_SIGN_UP") {
    return (
      <div>
        <h2>Sign Up Confirm</h2>
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="confirmCode">
            <Form.Label>Confirmation Code</Form.Label>
            <Form.Control
              type="text"
              name="confirmationCode"
              placeholder="Enter confirmation code"
              value={values.confirmationCode}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.confirmationCode && !!errors.confirmationCode}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmationCode}
            </Form.Control.Feedback>
          </Form.Group>
          <div>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  if (signUpStep === "DONE") {
    return <p>sign up complete</p>;
  }

  return <p>signUpStep: {signUpStep}</p>;
};
export default SignUpConfirm;

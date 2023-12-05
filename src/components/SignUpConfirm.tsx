import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { confirmSignUp, ConfirmSignUpInput } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSignUpContext } from "../context/SignUpContext";

const validationSchema = yup.object().shape({
  confirmationCode: yup.string().required("Required"),
});

const SignUpConfirm = () => {
  const [signUpConfirmError, setSignUpConfirmError] = useState("");
  const { signUpStep, setSignUpStep, username } = useSignUpContext();

  const navigate = useNavigate();

  const initialValues: ConfirmSignUpInput = {
    username: username,
    confirmationCode: "",
  };

  const onSubmit = async (values: ConfirmSignUpInput) => {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: username,
        confirmationCode: values.confirmationCode,
      });

      setSignUpStep(nextStep.signUpStep);

      // Use COMPLETE_AUTO_SIGN_IN instead?
      // That would text or email a link to the user.
      // https://docs.amplify.aws/javascript/build-a-backend/auth/enable-sign-up/#auto-sign-in
      if (isSignUpComplete) {
        navigate("/signin");
      }
    } catch (error) {
      setSignUpConfirmError("There was a problem confirming your sign up.");
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
      <>
        <h2>Sign Up Confirmation</h2>
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
        {signUpConfirmError && <p>{signUpConfirmError}</p>}
      </>
    );
  }

  if (signUpStep === "DONE") {
    return <p>Sign up complete.</p>;
  }
};
export default SignUpConfirm;

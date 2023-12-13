import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import { confirmSignUp, ConfirmSignUpInput, AuthError } from "aws-amplify/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useSignUpContext } from "../context/SignUpContext";

const validationSchema = yup.object().shape({
  confirmationCode: yup.string().required("Required"),
});

const SignUpConfirm = () => {
  const [signUpConfirmError, setSignUpConfirmError] = useState("");
  const [isSignUpConfirmed, setIsSignUpConfirmed] = useState(false);
  const { setSignUpStep, username } = useSignUpContext();

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
      setIsSignUpConfirmed(isSignUpComplete);
    } catch (error) {
      if (error instanceof AuthError) {
        setSignUpConfirmError(
          `There was a problem confirming your sign up: ${error.message}`
        );
      } else {
        setSignUpConfirmError("There was a problem confirming your sign up.");
      }
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

  if (!isSignUpConfirmed) {
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
        {signUpConfirmError && (
          <Alert variant="warning">{signUpConfirmError}</Alert>
        )}
      </>
    );
  } else {
    return (
      <Alert variant="success">
        <p>
          Sign up complete. Please <Link to="/signin">sign in</Link>.
        </p>
      </Alert>
    );
  }
};
export default SignUpConfirm;

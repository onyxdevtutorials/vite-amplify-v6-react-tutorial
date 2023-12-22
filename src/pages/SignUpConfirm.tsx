import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import {
  confirmSignUp,
  ConfirmSignUpInput,
  AuthError,
  getCurrentUser,
} from "aws-amplify/auth";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object().shape({
  confirmationCode: yup.string().required("Required"),
});

const checkForUser = async () => {
  try {
    const { username, userId, signInDetails } = await getCurrentUser();
    console.log(`The username: ${username}`);
    console.log(`The userId: ${userId}`);
    console.log(`The signInDetails: ${signInDetails}`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const SignUpConfirm = () => {
  const { username = "" } = useParams<{ username: string }>();
  const [signUpConfirmError, setSignUpConfirmError] = useState("");
  const [isSignUpConfirmed, setIsSignUpConfirmed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkForUser().then((res) => setIsLoggedIn(res));
  });

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

  if (isLoggedIn) {
    return (
      <Alert variant="warning">
        <p>You are already signed in. You have no business confirming :-D</p>
      </Alert>
    );
  }

  if (isSignUpConfirmed) {
    return (
      <Alert variant="success">
        <p>
          Sign up complete. Please <Link to="/signin">sign in</Link>.
        </p>
      </Alert>
    );
  }

  return (
    <>
      <h2>Sign Up Confirmation</h2>
      <Form onSubmit={handleSubmit} noValidate className="sign-up-confirm-form">
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.username && !!errors.username}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.username}
          </Form.Control.Feedback>
        </Form.Group>
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
};

//   if (signUpStep === "DONE") {
//     return (
//       <Alert variant="success">
//         <p>
//           Sign up complete. Please <Link to="/signin">sign in</Link>.
//         </p>
//       </Alert>
//     );
//   }

export default SignUpConfirm;

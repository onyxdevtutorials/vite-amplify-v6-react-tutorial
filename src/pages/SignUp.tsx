import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { signUp, AuthError, getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

type SignUpType = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
};

const initialValues: SignUpType = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
};

const validationSchema = yup.object().shape({
  username: yup.string().required("Required"),
  password: yup.string().required("Required"),
  email: yup.string().email("Not a proper email").required("Required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords don't match!")
    .required("Required"),
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

const SignUp: React.FC = () => {
  const [signUpError, setSignUpError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkForUser().then((res) => setIsLoggedIn(res));
  }, []);

  const onSubmit = async (values: SignUpType) => {
    const { username, password, email } = values;

    try {
      const { nextStep } = await signUp({
        username: username,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
          autoSignIn: true,
        },
      });
      console.log("setSignUpStep(nextStep.signUpStep)", nextStep.signUpStep);
      navigate(`/signupconfirm/${username}`);
    } catch (error) {
      console.error("could not sign up", error);
      if (error instanceof AuthError) {
        setSignUpError(`There was a problem signing you up: ${error.message}`);
      } else {
        setSignUpError("There was a problem signing you up: Unknown error.");
      }
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
      <>
        <h1>Sign Up</h1>
        <p>
          You are logged in now. To sign up with a new account you must first
          sign out.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Sign Up</h1>
      <Form
        onSubmit={handleSubmit}
        noValidate
        className="sign-up-form"
        aria-label="sign up form"
      >
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
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
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
        <Form.Group controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder="Enter password again"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.email && !!errors.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>
        <div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Sign Up
          </Button>
        </div>
      </Form>
      {signUpError && <Alert variant="warning">{signUpError}</Alert>}
    </>
  );
};
export default SignUp;

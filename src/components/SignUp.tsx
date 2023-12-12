import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { signUp, AuthError } from "aws-amplify/auth";
import { useSignUpContext } from "../context/SignUpContext";

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

const SignUp = () => {
  const [signUpError, setSignUpError] = useState("");
  const { signUpStep, setSignUpStep, setUsername } = useSignUpContext();

  const onSubmit = async (values: SignUpType) => {
    const { username, password, email } = values;
    setUsername(username);

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

      setSignUpStep(nextStep.signUpStep);
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

  if (!signUpStep) {
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
        {signUpError && <p>{signUpError}</p>}
      </>
    );
  }
};
export default SignUp;

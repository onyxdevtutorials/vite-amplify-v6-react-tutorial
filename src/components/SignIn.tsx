import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Alert } from "react-bootstrap";
import { SignInInput } from "aws-amplify/auth";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";
import { useNavigate } from "react-router-dom";

const initialState = { username: "", password: "" };

const validationSchema = yup.object().shape({
  username: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const SignIn = () => {
  const initialValues: SignInInput = initialState;
  const navigate = useNavigate();
  const { signIn } = useAuthContext();
  const { signInStep } = useSignInContext();

  const onSubmit = async (values: SignInInput) => {
    const { username, password } = values;

    try {
      await signIn({ username, password }, navigate);
      navigate("/");
    } catch (error) {
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

  return (
    <Alert variant="danger">
      <p>There was a problem signing you in.</p>
    </Alert>
  );
};
export default SignIn;

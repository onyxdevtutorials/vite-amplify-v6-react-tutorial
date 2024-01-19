import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { SignInInput, AuthError } from "aws-amplify/auth";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const initialState = { username: "", password: "" };

const validationSchema = yup.object().shape({
  username: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const SignIn = () => {
  const initialValues: SignInInput = initialState;
  const navigate = useNavigate();
  const { signIn } = useAuthContext();

  const onSubmit = async (
    values: SignInInput,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const { username, password } = values;

    try {
      setSubmitting(true);
      await signIn({ username, password }, navigate);
      toast.success("Successfully signed in!");
    } catch (error) {
      const authError = error as AuthError;
      toast.error(`Error signing in: ${authError.message}`);
      console.error(`Error signing in: ${authError.message}`);
    } finally {
      setSubmitting(false);
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
    onSubmit: (values, formikHelpers) => onSubmit(values, formikHelpers),
  });

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        noValidate
        className="sign-in-form"
        aria-label="sign in form"
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
};

export default SignIn;

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import { ConfirmSignUpInput } from "aws-amplify/auth";
import { Alert } from "react-bootstrap";

const validationSchema = yup.object().shape({
  confirmationCode: yup.string().required("Required"),
});

const SignUpConfirm = () => {
  const { username = "" } = useParams<{ username: string }>();
  const { confirmSignUp, isLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  const initialValues: ConfirmSignUpInput = {
    username: username,
    confirmationCode: "",
  };

  const onSubmit = async (
    values: ConfirmSignUpInput,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setSubmitting(true);
    await confirmSignUp(values, navigate);
    setSubmitting(false);
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

  if (isLoggedIn) {
    return (
      <Alert variant="warning">
        <p>You are already signed in. You have no business confirming :-D</p>
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
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

export default SignUpConfirm;

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ConfirmSignInInput } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";

const validationSchema = yup.object().shape({
  challengeResponse: yup.string().required("Required"),
});

const SignInConfirm = () => {
  const navigate = useNavigate();
  const initialValues: ConfirmSignInInput = { challengeResponse: "" };

  const { confirmSignIn } = useAuthContext();

  const onSubmit = async (values: ConfirmSignInInput) => {
    const { challengeResponse } = values;

    await confirmSignIn({ challengeResponse }, navigate);
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

  return (
    <>
      <h2>Please Set a New Password</h2>
      <Form onSubmit={handleSubmit} noValidate className="sign-in-confirm-form">
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="challengeResponse"
            placeholder="Password"
            value={values.challengeResponse}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.challengeResponse && !!errors.challengeResponse}
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
    </>
  );
};

export default SignInConfirm;

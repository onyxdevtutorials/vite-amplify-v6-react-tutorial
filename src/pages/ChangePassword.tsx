import {
  signIn,
  updatePassword,
  type UpdatePasswordInput,
} from "aws-amplify/auth";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

type Actions = {
  resetForm: () => void;
};

const initialValues: UpdatePasswordInput = { oldPassword: "", newPassword: "" };

const validationSchema = yup.object().shape({
  oldPassword: yup.string().required("Required"),
  newPassword: yup.string().required("Required"),
});

const handleUpdatePassword = async ({
  oldPassword,
  newPassword,
  username,
}: UpdatePasswordInput) => {
  try {
    await signIn({ username });
    const result = await updatePassword({ oldPassword, newPassword });
    console.log("does updatePassword return anything?", result);
  } catch (error) {
    console.error("Problem updating password:", error);
  }
};

const ChangePassword = () => {
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
    onSubmit: handleUpdatePassword,
  });

  const { setIsLoggedIn } = useAuthContext();

  const navigate = useNavigate();

  const params = useParams();
  console.log("params", params);

  return (
    <div>
      <h1>Change Password</h1>
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={params.username}
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="oldPassword">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            name="oldPassword"
            placeholder="Enter old password"
            value={values.oldPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.oldPassword && !!errors.oldPassword}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.oldPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={touched.newPassword && !!errors.newPassword}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.newPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <div>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Change Password
          </Button>
        </div>
      </Form>
    </div>
  );
};
export default ChangePassword;

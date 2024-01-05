import {
  updatePassword,
  getCurrentUser,
  UpdatePasswordInput,
  AuthError,
} from "aws-amplify/auth";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const initialValues: UpdatePasswordInput = { oldPassword: "", newPassword: "" };

const validationSchema = yup.object().shape({
  oldPassword: yup.string().required("Required"),
  newPassword: yup
    .string()
    .required("Required")
    .notOneOf(
      [yup.ref("oldPassword")],
      "New password may not match old password."
    ),
});

const ChangePassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setUsername(user.username);
      } catch (error) {
        console.error("Problem getting current user", error);
        navigate("/signin");
      }
    };
    checkUser();
  });

  const handleUpdatePassword = async ({
    oldPassword,
    newPassword,
  }: UpdatePasswordInput) => {
    try {
      await updatePassword({ oldPassword, newPassword });
      toast.success("Password changed successfully");
    } catch (error) {
      const authError = error as AuthError;
      console.error(`Problem updating password: ${authError.message}`);
      setChangePasswordError(`Problem updating password: ${authError.message}`);
    }
  };

  const [changePasswordError, setChangePasswordError] = useState("");

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

  return (
    <div>
      <h1>Change Password</h1>
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" name="username" value={username} readOnly />
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
      {changePasswordError && (
        <Alert variant="danger">{changePasswordError}</Alert>
      )}
    </div>
  );
};
export default ChangePassword;

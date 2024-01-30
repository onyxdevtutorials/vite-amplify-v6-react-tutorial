import useGetUser from "../hooks/useGetUser";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { FormikValues, useFormik } from "formik";
import { useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { updateUser } from "../graphql/mutations";
import * as yup from "yup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const client = generateClient();

const validationSchema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
});

const EditUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const {
    user,
    errorMessage: getUserErrorMessage,
    isLoading,
  } = useGetUser(userId);

  const initialValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  };

  const onSubmit = async (values: FormikValues) => {
    if (!userId) return;
    const { firstName, lastName } = values;
    console.log("values: ", values);
    const userData = {
      firstName,
      lastName,
      id: userId,
    };
    try {
      await client.graphql({
        query: updateUser,
        variables: {
          input: userData,
        },
      });
      toast.success("User updated successfully");
      navigate(`/users/${userId}`);
    } catch (err) {
      console.error("error updating user: ", err);
      toast.error("Error updating user");
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    if (getUserErrorMessage) {
      toast.error(getUserErrorMessage);
    }

    if (user) {
      resetForm({
        values: {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
        },
      });
    }
  }, [getUserErrorMessage, user, resetForm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label="user profile form">
      <Form.Group controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          name="username"
          value={user?.username}
          readOnly
        />
      </Form.Group>
      <Form.Group controlId="firstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          isInvalid={!!errors.firstName && touched.firstName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstName}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="lastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          isInvalid={!!errors.lastName && touched.lastName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName}
        </Form.Control.Feedback>
      </Form.Group>
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </Form>
  );
};
export default EditUserProfile;

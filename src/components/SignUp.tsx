import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFormik } from "formik";
import * as yup from "yup";
import { signUp, SignUpInput } from "aws-amplify/auth";
import { useAuthContext } from "../context/AuthContext";
import { useSignUpContext } from "../context/SignUpContext";

type Actions = {
  resetForm: () => void;
};

type SignUpType = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
};

const SignUp = () => {
  const { signUpStep, setSignUpStep, setUsername } = useSignUpContext();

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

  const onSubmit = async (values: SignUpType, actions: Actions) => {
    const { username, password, email } = values;
    setUsername(username);

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: username,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
          autoSignIn: true,
        },
      });

      console.log("isSignUpComplete", isSignUpComplete);
      console.log("userId", userId);
      console.log("nextStep", nextStep);
      // nextStep = {codeDeliveryDetails: {}, signUpStep: "CONFIRM_SIGN_UP"}
      // other possible values for signUpStep?
      // "DONE" | "CONFIRM_SIGN_UP" | "COMPLETE_AUTO_SIGN_IN"

      // maybe change the context value to authStep or
      // have separate signIn and signUp steps.
      // or have a separate, narrower context, given
      // that the whole app doesn't have to know this
      // stuff.
      setSignUpStep(nextStep.signUpStep);
      //   if (nextStep && nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      //     // show confirm dialog
      //     setSignUpStep(nextStep.signUpStep);
      //   } else {
      //     // tell user about error
      //   }
    } catch (error) {
      console.error("could not sign up", error);
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
        <Form.Group>
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
        <Form.Group>
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
        <Form.Group>
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
    );
  }
};
export default SignUp;

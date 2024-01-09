import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { useFormik } from "formik";
import * as yup from "yup";
import { generateClient } from "aws-amplify/api";
import { createReview } from "../graphql/mutations";
import { useParams } from "react-router-dom";
import useGetProduct from "../hooks/useGetProduct";
import { Card } from "react-bootstrap";
import useCheckForUser from "../hooks/useCheckForUser";
import { toast } from "react-toastify";

const validationSchema = yup.object().shape({
  rating: yup.number().required("Required"),
  content: yup.string().required("Required"),
});

const client = generateClient();

const AddReview = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, isLoading } = useGetProduct(productId);
  const { user } = useCheckForUser();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: {
      rating: 0,
      content: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const { rating, content } = values;
      const reviewInput = {
        rating,
        content,
        productReviewsId: productId,
        userReviewsId: user?.userId,
      };

      try {
        const graphqlObject = {
          query: createReview,
          variables: {
            input: reviewInput,
          },
        };

        await client.graphql(graphqlObject);
        toast.success("Review added successfully");
      } catch (err) {
        console.error("error creating review: ", err);
        toast.error("Error creating review");
      }
    },
  });

  if (isLoading) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>Product</Card.Title>
          <Card.Text>{product?.name}</Card.Text>
          <Card.Text>{product?.description}</Card.Text>
          <Card.Text>{product?.price}</Card.Text>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Card.Title>Add Review</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="rating">
              <Form.Label>Rating</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={5}
                name="rating"
                placeholder="1-5"
                value={values.rating}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!errors.rating && touched.rating}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.rating}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="content">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={values.content}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!errors.content && touched.content}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.content}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};
export default AddReview;

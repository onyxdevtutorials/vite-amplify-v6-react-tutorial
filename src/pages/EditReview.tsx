import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams } from "react-router-dom";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { updateReview } from "../graphql/mutations";
import { getReview } from "../graphql/queries";
import { GetReviewQuery } from "../API";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Review } from "../API";
import { toast } from "react-toastify";

const client = generateClient();

const validationSchema = yup.object().shape({
  content: yup.string().required("Required"),
  rating: yup
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .required("Required"),
});

const EditReview = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const [review, setReview] = useState<Review | null>(null);

  const initialValues = {
    content: review?.content || "",
    rating: review?.rating || 0,
  };

  const onSubmit = async (values: { content: string; rating: number }) => {
    if (!reviewId) return;

    try {
      await client.graphql({
        query: updateReview,
        variables: {
          input: {
            id: reviewId,
            ...values,
          },
        },
      });
      toast.success("Review updated successfully");
    } catch (err) {
      console.error("error updating review: ", err);
      toast.error("Error updating review");
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
    resetForm,
  } = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    const fetchReview = async () => {
      if (!reviewId) {
        console.error("no review id provided");
        return;
      }

      try {
        const result = (await client.graphql({
          query: getReview,
          variables: { id: reviewId },
        })) as GraphQLResult<GetReviewQuery>;

        const reviewData = result.data?.getReview;
        console.log("reviewData: ", reviewData);
        if (!reviewData || result.errors) {
          console.error("error fetching review: ", result.errors);
          return;
        } else {
          setReview(reviewData);
          const formData = {
            content: reviewData.content || "",
            rating: reviewData.rating || 0,
          };
          resetForm({ values: formData });
        }
      } catch (err) {
        console.error("error fetching review: ", err);
      }
    };

    fetchReview();
  }, [resetForm, reviewId]);

  return (
    <div>
      <h1>Edit Review</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="content">
          <Form.Label>Content</Form.Label>
          <Form.Control
            type="text"
            as="textarea"
            name="content"
            placeholder="Enter content"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.content}
            isInvalid={!!errors.content && touched.content}
          />
          <Form.Control.Feedback type="invalid">
            {errors.content}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="rating">
          <Form.Label>Rating</Form.Label>
          <Form.Control
            type="number"
            min={1}
            max={5}
            name="rating"
            placeholder="Enter rating"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.rating}
            isInvalid={!!errors.rating && touched.rating}
          />
          <Form.Control.Feedback type="invalid">
            {errors.rating}
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
        >
          Update
        </Button>
      </Form>
    </div>
  );
};

export default EditReview;

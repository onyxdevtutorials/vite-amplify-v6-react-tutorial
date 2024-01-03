import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { ToastContainer } from "react-bootstrap";
import Toast from "react-bootstrap/Toast";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Link, useParams } from "react-router-dom";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { updateProduct } from "../graphql/mutations";
import { getProduct } from "../graphql/queries";
import { GetProductQuery } from "../API";

const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  price: yup.string().required("Required"),
});

type Product = {
  name: string;
  description: string;
  price: string;
  id: string;
};

const client = generateClient();

const EditProduct = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const { productId } = useParams<{ productId: string }>();

  console.log("Edit Product page productId: ", productId);
  const initialFormValues = {
    name: "",
    description: "",
    price: "",
    id: "",
  };

  const onSubmit = async (values: Product) => {
    if (!productId) return;
    const { name, description, price } = values;
    const product = { name, description, price, id: productId };
    try {
      await client.graphql({
        query: updateProduct,
        variables: {
          input: product,
        },
      });
      setShowToast(true);
    } catch (err) {
      console.error("error updating product: ", err);
      setErrorMessage("Error updating product id: " + productId);
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
    initialValues: initialFormValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId) return;
        const result: GraphQLResult<GetProductQuery> = await client.graphql({
          query: getProduct,
          variables: { id: productId },
        });
        const productData = result.data?.getProduct;
        if (!productData) {
          setErrorMessage("Error getting product");
          return;
        }
        const name = productData.name || "";
        const description = productData.description || "";
        const price = productData.price || "";
        const id = productData.id || "";
        const formValues = { name, description, price, id };
        console.log("formValues: ", formValues);
        resetForm({ values: formValues });
      } catch (err) {
        console.error("error getting product:", err);
        setErrorMessage("Error getting product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, resetForm]);

  if (loading) {
    return (
      <>
        <Link to="/">List Products</Link>
        <h1>Edit Product</h1>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Link to="/">List Products</Link>
      <h1>Edit Product</h1>
      <Form onSubmit={handleSubmit} noValidate aria-label="edit product form">
        <Form.Group controlId="productName">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={!!errors.name && touched.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="productDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={!!errors.description && touched.description}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.description}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="productPrice">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="text"
            name="price"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={!!errors.price && touched.price}
            required
          />
          <Form.Control.Feedback type="invalid">
            {errors.price}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Update
        </Button>
      </Form>
      <Alert variant="danger" show={!!errorMessage}>
        {errorMessage}
      </Alert>
      <ToastContainer position="top-center" style={{ zIndex: 1 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header style={{ justifyContent: "space-between" }}>
            <strong>Success</strong>
          </Toast.Header>
          <Toast.Body style={{ color: "white" }}>
            Product updated successfully
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};
export default EditProduct;

import { TransferProgressEvent, uploadData } from "aws-amplify/storage";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { createProduct } from "../graphql/mutations";

const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  price: yup.string().required("Required"),
});

const initialValues = {
  name: "",
  description: "",
  price: "",
  image: null,
};

type Product = {
  name: string;
  description: string;
  price: string;
  image: File | null;
};

const client = generateClient();

const AddProduct = () => {
  const [imageKey, setImageKey] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);

  const onProgress = (event: TransferProgressEvent) => {
    const { transferredBytes, totalBytes } = event;
    if (!transferredBytes || !totalBytes) return;

    if (transferredBytes === totalBytes) setProgress(null);

    console.log(`progress: ${transferredBytes}/${totalBytes}`);
    setProgress(Math.round((transferredBytes / totalBytes) * 100));
  };

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event?.target?.files) {
      const file = event.target.files[0];
      try {
        const result = await uploadData({
          key: file.name,
          data: file,
          options: {
            accessLevel: "guest",
            onProgress,
          },
        }).result;
        setImageKey(result.key);
        setProgress(null);
        toast.success("Image uploaded successfully");
        console.log("upload succeeded: ", result);
      } catch (err) {
        console.error("error uploading image:", err);
        toast.error("Error uploading image");
      }
    }
  };
  const onSubmit = async (values: Product) => {
    const { name, description, price } = values;
    const product = { name, description, price, image: imageKey };
    console.log("product:", product);
    try {
      await client.graphql({
        query: createProduct,
        variables: {
          input: product,
        },
      });
      toast.success("Product added successfully");
    } catch (err) {
      console.error("error creating product:", err);
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
  } = useFormik({ initialValues, validationSchema, onSubmit });

  return (
    <div>
      <Link to="/">List Products</Link>
      <h1>Add Product</h1>
      <Form onSubmit={handleSubmit} noValidate>
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
        <Form.Group controlId="productImage">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            name="image"
            onChange={handleFileSelect}
            // onChange={(e) =>
            //   handleFileSelect(e as React.ChangeEvent<HTMLInputElement>)
            // }
            onBlur={handleBlur}
            isInvalid={!!errors.image && touched.image}
          />
          <div>
            {progress !== null && (
              <ProgressBar now={progress} label={`${progress}%`} />
            )}
          </div>
          <Form.Control.Feedback type="invalid">
            {errors.image}
          </Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          Add
        </Button>
      </Form>
    </div>
  );
};
export default AddProduct;

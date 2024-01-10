import { TransferProgressEvent, uploadData } from "aws-amplify/storage";
import { FormikHelpers, useFormik } from "formik";
import * as yup from "yup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toast, Id } from "react-toastify";
import { useState } from "react";

type FormValues = {
  name: string;
  description: string;
  price: string;
  image: File | null;
};

type ProductFormProps = {
  initialValues: FormValues;
  onSubmit: (
    values: FormValues,
    imageKey: string,
    formikHelpers: FormikHelpers<FormValues>
  ) => void;
};

const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  description: yup.string().required("Required"),
  price: yup.string().required("Required"),
  image: yup.string().nullable(),
});

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const [imageKey, setImageKey] = useState<string>("");
  let loadingToastId: Id | null = null;

  const handleSubmitWithImageKey: React.FormEventHandler<HTMLFormElement> = (
    e
  ) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, formikHelpers) =>
      onSubmit(values, imageKey, formikHelpers),
  });

  const onProgress = (event: TransferProgressEvent) => {
    const { transferredBytes, totalBytes } = event;
    if (!transferredBytes || !totalBytes) return;

    const progress = Math.round((transferredBytes / totalBytes) * 100);

    if (loadingToastId) {
      toast.update(loadingToastId, {
        render: `Upload progress: ${progress}%`,
        progress: progress / 100,
      });

      if (progress === 100) {
        toast.done(loadingToastId);
      }
    }
  };

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event?.target?.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const validImageTypes = ["image/jpg", "image/jpeg", "image/png"];

      if (!validImageTypes.includes(file.type)) {
        toast.error("Unsupported file type");
        return;
      }

      loadingToastId = toast.info(`Upload progress: 0%`, {
        progress: 0,
        autoClose: false,
      });

      try {
        const uploadOutput = await uploadData({
          key: file.name,
          data: file,
          options: {
            accessLevel: "guest",
            onProgress,
          },
        });

        const result = await uploadOutput.result;
        setImageKey(result.key);
        toast.success("Image uploaded successfully");
        console.log("upload succeeded: ", result);
      } catch (err) {
        console.error("error uploading image:", err);
        toast.error("Error uploading image");
      }
    } else {
      toast.error("No file selected");
    }
  };

  return (
    <Form onSubmit={handleSubmitWithImageKey} noValidate>
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
          value={values.description || ""}
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
          value={values.price || ""}
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
          onBlur={handleBlur}
          isInvalid={!!errors.image && touched.image}
        />
        <Form.Control.Feedback type="invalid">
          {errors.image}
        </Form.Control.Feedback>
      </Form.Group>
      <Button type="submit" disabled={isSubmitting}>
        Submit
      </Button>
    </Form>
  );
};

export default ProductForm;

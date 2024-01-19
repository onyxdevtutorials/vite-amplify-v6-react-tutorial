import { toast } from "react-toastify";
import { useEffect } from "react";
import { FormikValues } from "formik";
import { Link, useParams } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { updateProduct } from "../graphql/mutations";
import useGetProduct from "../hooks/useGetProduct";
import ProductForm from "../components/ProductForm";

const client = generateClient();

const EditProduct = () => {
  const { productId } = useParams<{ productId: string }>();
  const {
    product,
    errorMessage: getProductErrorMessage,
    isLoading,
  } = useGetProduct(productId);

  useEffect(() => {
    if (getProductErrorMessage) {
      toast.error(getProductErrorMessage);
    }
  }, [getProductErrorMessage]);

  const initialFormValues = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
  };

  const onSubmit = async (values: FormikValues) => {
    if (!productId) return;
    const { name, description, price, image } = values;
    const productData = {
      name,
      description,
      price,
      image: image || product?.image,
      id: productId,
    };
    try {
      await client.graphql({
        query: updateProduct,
        variables: {
          input: productData,
        },
      });
      toast.success("Product updated successfully");
    } catch (err) {
      console.error("error updating product: ", err);
      toast.error("Error updating product");
    }
  };

  const handleRemoveImage = async () => {
    toast.info("Removing image is not yet implemented");
  };

  if (isLoading) {
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
      <ProductForm
        initialValues={initialFormValues}
        onSubmit={onSubmit}
        initialImageKey={product?.image || undefined}
        onRemoveImage={handleRemoveImage}
      />
    </>
  );
};

export default EditProduct;

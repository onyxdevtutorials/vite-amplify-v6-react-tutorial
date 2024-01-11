import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { FormikValues, useFormik } from "formik";
import { Link, useParams } from "react-router-dom";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import { updateProduct } from "../graphql/mutations";
import { getProduct } from "../graphql/queries";
import { GetProductQuery } from "../API";
import useGetProduct from "../hooks/useGetProduct";
import ProductForm from "../components/ProductForm";

type Product = {
  name: string;
  description: string;
  price: string;
  id: string;
};

const client = generateClient();

const EditProduct = () => {
  const { productId } = useParams<{ productId: string }>();
  const {
    product,
    errorMessage: getProductErrorMessage,
    isLoading,
  } = useGetProduct(productId);

  console.log("Edit Product page productId: ", product);
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
    // to come
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

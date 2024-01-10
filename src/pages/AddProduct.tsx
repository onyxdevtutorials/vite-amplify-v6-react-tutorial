import { toast } from "react-toastify";
import { FormikValues } from "formik";
import { Link } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { createProduct } from "../graphql/mutations";
import { ProductForm } from "../components";

const initialValues = {
  name: "",
  description: "",
  price: "",
  image: null,
};

const client = generateClient();

const AddProduct = () => {
  const onSubmit = async (values: FormikValues) => {
    const { name, description, price, image } = values;
    const product = { name, description, price, image };

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

  return (
    <div>
      <Link to="/">List Products</Link>
      <h1>Add Product</h1>
      <ProductForm initialValues={initialValues} onSubmit={onSubmit} />
    </div>
  );
};
export default AddProduct;

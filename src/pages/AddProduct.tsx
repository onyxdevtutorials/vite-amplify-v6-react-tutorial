import { Link } from "react-router-dom";
import { useState } from "react";
import { generateClient } from "aws-amplify/api";

import { createProduct } from "../graphql/mutations";

const client = generateClient();

const initialState = { name: "", description: "", price: "" };

const AddProduct = () => {
  const [formState, setFormState] = useState(initialState);

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  async function addProduct() {
    try {
      if (!formState.name || !formState.description || !formState.price) return;
      const product = { ...formState };
      setFormState(initialState);
      await client.graphql({
        query: createProduct,
        variables: {
          input: product,
        },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    addProduct();
  };

  return (
    <div>
      <Link to="/">List Products</Link>
      <h1>Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            value={formState.name}
            onChange={(e) => setInput("name", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            value={formState.description}
            onChange={(e) => setInput("description", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <input
            type="text"
            name="price"
            value={formState.price}
            onChange={(e) => setInput("price", e.target.value)}
          />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
};
export default AddProduct;

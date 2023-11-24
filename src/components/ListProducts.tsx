import { generateClient } from "aws-amplify/api";
import { listProducts } from "../graphql/queries";
import { useEffect, useState } from "react";
import { Product } from "../API";
import { Auth } from "aws-amplify";

const client = generateClient();

import { getCurrentUser } from "aws-amplify/auth";

async function checkForUser() {
  try {
    const { username, userId, signInDetails } = await getCurrentUser();
    console.log(`The username: ${username}`);
    console.log(`The userId: ${userId}`);
    console.log(`The signInDetails: ${signInDetails}`);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const ListProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const isLoggedIn = await checkForUser();
    try {
      const productsData = await client.graphql({
        query: listProducts,
        authMode: isLoggedIn ? "userPool" : "iam",
      });
      setProducts(productsData.data.listProducts.items);
    } catch (error) {
      console.error("error fetching products", error);
    }
  };

  return (
    <div>
      <h1>List Products</h1>
      {products.map((product, index) => (
        <div key={product.id ? product.id : index}>
          <p>{product.name}</p>
          <p>{product.description}</p>
          <p>{product.price}</p>
        </div>
      ))}
    </div>
  );
};
export default ListProducts;

import { generateClient } from "aws-amplify/api";
import { listProducts } from "../graphql/queries";
import { useEffect, useState } from "react";
import { Product } from "../API";
import Card from "react-bootstrap/Card";

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
    // "iam" is for public access
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
        <Card key={product.id ? product.id : index}>
          <Card.Body>
            <Card.Title aria-label="product name" className="product-name">
              {product.name}
            </Card.Title>
            <Card.Text>{product.description}</Card.Text>
            <Card.Text>{product.price}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};
export default ListProducts;

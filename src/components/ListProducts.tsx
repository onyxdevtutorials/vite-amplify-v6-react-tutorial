import { generateClient } from "aws-amplify/api";
import { listProducts } from "../graphql/queries";
import { useEffect, useState } from "react";
import { Product } from "../API";

const client = generateClient();

const ListProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await client.graphql({
        query: listProducts,
        authMode: "iam",
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

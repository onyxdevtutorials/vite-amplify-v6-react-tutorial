import React from "react";
import Card from "react-bootstrap/Card";
import { useAuthContext } from "../context/AuthContext";
import { Product as ProductType } from "../API";
interface ProductProps {
  product: ProductType;
}

const Product: React.FC<ProductProps> = ({ product }) => {
  const handleEdit = () => {
    // Handle edit logic here
  };

  const handleDelete = () => {
    // Handle delete logic here
  };

  const isAdmin = useAuthContext().isAdmin;

  return (
    <div>
      <Card role="listitem">
        <Card.Body>
          <Card.Title aria-label="product name" className="product-name">
            {product.name}
          </Card.Title>
          <Card.Text>{product.description}</Card.Text>
          <Card.Text>{product.price}</Card.Text>
          <Card.Text>
            {isAdmin && (
              <div>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Product;

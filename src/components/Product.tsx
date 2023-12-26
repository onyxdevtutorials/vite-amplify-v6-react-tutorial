import React from "react";
import Card from "react-bootstrap/Card";
import { Product as ProductType } from "../API";
import { useNavigate } from "react-router-dom";

interface ProductProps {
  product: ProductType;
  isAdmin: boolean;
}

const Product: React.FC<ProductProps> = ({ product, isAdmin }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/edit/${product.id}`);
  };

  const handleDelete = () => {
    // Handle delete logic here
  };

  return (
    <div>
      <Card role="listitem">
        <Card.Body>
          <Card.Title aria-label="product name" className="product-name">
            {product.name}
          </Card.Title>
          <Card.Text>{product.description}</Card.Text>
          <Card.Text>{product.price}</Card.Text>
          <div>
            {isAdmin && (
              <div>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Product;

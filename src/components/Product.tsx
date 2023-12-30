import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { ProductWithReviews } from "../types";
import { archiveProduct, restoreProduct } from "../graphql/customMutations";
import { generateClient } from "aws-amplify/api";

interface ProductProps {
  product: ProductWithReviews;
  isAdmin: boolean;
}

const client = generateClient();

const Product: React.FC<ProductProps> = ({ product, isAdmin }) => {
  const navigate = useNavigate();
  const [isArchived, setIsArchived] = useState(product.isArchived);

  const handleEdit = () => {
    navigate(`/edit/${product.id}`);
  };

  const handleArchiveOrRestore = async () => {
    try {
      if (isArchived) {
        await client.graphql({
          query: restoreProduct,
          variables: { id: product.id },
        });
      } else {
        await client.graphql({
          query: archiveProduct,
          variables: { id: product.id },
        });
      }
      setIsArchived(!isArchived);
    } catch (err) {
      console.error("error updating product: ", err);
    }
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
          <Card.Text>{product.reviews?.items?.length || 0} reviews</Card.Text>
          <div>
            {isAdmin && (
              <div>
                <button onClick={handleEdit}>Edit</button>
                <button onClick={handleArchiveOrRestore}>
                  {isArchived ? "Restore" : "Archive"}
                </button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Product;

import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import { useNavigate } from "react-router-dom";
import { Product as ProductType } from "../types";
import { archiveProduct, restoreProduct } from "../graphql/customMutations";
import { generateClient } from "aws-amplify/api";
import { Button } from "react-bootstrap";

interface ProductProps {
  product: ProductType;
  isAdmin: boolean;
}

const client = generateClient();

const Product: React.FC<ProductProps> = ({ product, isAdmin }) => {
  const navigate = useNavigate();
  const [isArchived, setIsArchived] = useState(product.isArchived);

  const handleEdit = () => {
    navigate(`/products/${product.id}/edit`);
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
          {product.image && (
            <Card.Img
              src={`https://productimagesbucket203201-myenv.s3.amazonaws.com/public/${product.image}`}
              alt={product.name}
              className="product-image"
            />
          )}
          <Card.Title aria-label="product name" className="product-name">
            {product.name}
          </Card.Title>
          <Card.Text>{product.description}</Card.Text>
          <Card.Text>{product.price}</Card.Text>
          <Card.Text>{product.reviews?.items?.length || 0} reviews</Card.Text>
          <div>
            {isAdmin && (
              <>
                <Button onClick={handleEdit}>Edit</Button>
                <Button onClick={handleArchiveOrRestore}>
                  {isArchived ? "Restore" : "Archive"}
                </Button>
              </>
            )}
            <>
              <Button onClick={() => navigate(`/products/${product.id}`)}>
                Detail
              </Button>
            </>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Product;

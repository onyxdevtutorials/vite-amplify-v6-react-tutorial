import { generateClient } from "aws-amplify/api";
import { listProductsWithReviews } from "../graphql/customQueries";
import { useEffect, useState, useCallback } from "react";
import { Product as ProductComponent } from "./index";
import useIsAdmin from "../hooks/useIsAdmin";
import useCheckForUser from "../hooks/useCheckForUser";
import { ProductWithReviews, ListProductsQueryWithReviews } from "../types";

const client = generateClient();

const ListProducts = () => {
  const [products, setProducts] = useState<ProductWithReviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, checkIsAdmin } = useIsAdmin();
  const { isLoggedIn, checkUser } = useCheckForUser();

  // memoize the function so it doesn't get recreated on every render
  const fetchProducts = useCallback(async () => {
    // "iam" is for public access
    try {
      const productsData = (await client.graphql({
        query: listProductsWithReviews,
        authMode: isLoggedIn ? "userPool" : "iam",
        // Fetch the reviews for each product
        variables: { limit: 1000 },
      })) as { data: ListProductsQueryWithReviews };

      if (productsData.data?.listProducts?.items) {
        const productsWithReviewCount = productsData.data.listProducts.items
          .filter(
            (product): product is NonNullable<typeof product> =>
              product !== null
          )
          .map((product) => {
            const reviewCount = product.reviews?.items.length || 0;
            return {
              ...product,
              reviewCount,
            };
          });
        setProducts(productsWithReviewCount || []);
      }
    } catch (error) {
      console.error("error fetching products", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    checkUser();
    if (isLoggedIn) {
      checkIsAdmin();
    }
  }, [checkUser, isLoggedIn, checkIsAdmin]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>List Products</h1>
      {products.length > 0 ? (
        <div role="list">
          {products.map((product) => (
            <ProductComponent
              key={product.id}
              product={product}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <p>No products to display</p>
      )}
    </div>
  );
};
export default ListProducts;

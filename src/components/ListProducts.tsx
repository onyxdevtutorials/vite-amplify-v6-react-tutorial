import { generateClient } from "aws-amplify/api";
import { listProductsWithReviews } from "../graphql/customQueries";
import { useEffect, useState, useCallback } from "react";
import { Product as ProductComponent } from "./index";
import { ProductWithReviews } from "../types";
import { ListProductsWithReviewsQuery } from "../API";
import { Button } from "react-bootstrap";
import { useAuthContext } from "../context/AuthContext";

const client = generateClient();

const ListProducts = () => {
  const [products, setProducts] = useState<ProductWithReviews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isLoggedIn } = useAuthContext();
  const [sortField, setSortField] = useState<"name" | "price">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSortField = () => {
    setSortField((prevField) => (prevField === "name" ? "price" : "name"));
  };

  const toggleSortDirection = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "asc" ? "desc" : "asc"
    );
  };

  // memoize the function so it doesn't get recreated on every render
  const fetchProducts = useCallback(async () => {
    // "iam" is for public access
    try {
      const productsData = (await client.graphql({
        query: listProductsWithReviews,
        authMode: isLoggedIn ? "userPool" : "iam",
        // Fetch the reviews for each product
        variables: { limit: 1000 },
      })) as { data: ListProductsWithReviewsQuery };

      if (productsData.data?.listProducts?.items) {
        const productsWithReviewCount = productsData.data.listProducts.items
          .map((product) => {
            if (product) {
              const reviewCount = product.reviews?.items.length || 0;
              return {
                ...product,
                reviewCount,
              };
            }
          })
          .filter(
            (product): product is ProductWithReviews => product !== undefined
          );

        setProducts(productsWithReviewCount);
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

  // useEffect(() => {
  //   checkUser();
  //   if (isLoggedIn) {
  //     checkIsAdmin();
  //   }
  // }, [checkUser, isLoggedIn, checkIsAdmin]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      if (a.price && b.price) {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return sortDirection === "asc" ? priceA - priceB : priceB - priceA;
      } else {
        return 0;
      }
    }
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>List Products</h1>
      {products.length > 0 ? (
        <>
          <Button onClick={toggleSortField}>
            Sort by {sortField === "price" ? "name" : "price"}
          </Button>
          <Button onClick={toggleSortDirection}>
            Sort {sortDirection === "asc" ? "descending" : "ascending"}
          </Button>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div role="list">
              {sortedProducts.map((product) => (
                <ProductComponent
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p>No products to display</p>
      )}
    </div>
  );
};
export default ListProducts;

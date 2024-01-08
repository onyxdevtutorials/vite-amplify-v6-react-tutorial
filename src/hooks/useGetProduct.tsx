import { useState, useEffect } from "react";
import { getProduct } from "../graphql/queries";
import { generateClient, GraphQLResult } from "aws-amplify/api";
import useCheckForUser from "../hooks/useCheckForUser";
import { GetProductQuery } from "../API";

const client = generateClient();

const useGetProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<GetProductQuery["getProduct"]>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useCheckForUser();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setErrorMessage("No product ID provided");
        setIsLoading(false);
        console.error("no product id provided");
        return;
      }

      try {
        setIsLoading(true);
        const result = (await client.graphql({
          query: getProduct,
          variables: { id: productId },
          authMode: isLoggedIn ? "userPool" : "iam",
        })) as GraphQLResult<GetProductQuery>;
        // console.log("result: ", result);
        const productData = result.data?.getProduct;
        // console.log("productData: ", productData);
        if (!productData || result.errors) {
          setErrorMessage("Error fetching product with ID: " + productId);
          return;
        }

        setProduct(productData);
      } catch (err) {
        console.error("error fetching product: ", err);
        setErrorMessage("Error fetching product with ID: " + productId);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isLoggedIn]);

  return { product, errorMessage, isLoading };
};

export default useGetProduct;

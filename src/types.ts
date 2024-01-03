import { ModelReviewConnection, Product } from "./API";

export type {
  Product,
  Review,
  GetProductQuery,
  ModelReviewConnection,
} from "./API";

export type GetProductResult = { getProduct: Product | undefined };

// export type ProductWithReviews = Product & { reviews?: { items: Review[] } };
export type ProductWithReviews = Product & {
  reviews?: ModelReviewConnection | null;
  reviewCount?: number;
};

export type ListProductsQueryWithReviews = {
  listProducts: {
    items: Product[];
    nextToken: string;
  };
};

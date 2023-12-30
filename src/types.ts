import { ModelReviewConnection, Product } from "./API";

export type { Product, Review } from "./API";

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

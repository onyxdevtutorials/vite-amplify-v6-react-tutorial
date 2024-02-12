import { Product, User, Review } from "./API";

export type ProductWithReviews = Product & {
  reviewCount: number;
};

export type ListProductsQueryWithReviews = {
  listProducts: {
    items: Product[];
    nextToken: string;
  };
};

export type UserWithReviews = User & {
  reviews?: {
    items: Review[];
  };
};

import { Product, Review } from "./API";

export type { Product, Review } from "./API";

export type ProductWithReviews = Product & { reviews?: { items: Review[] } };

export type ListProductsQueryWithReviews = {
  listProducts?: {
    items?: ProductWithReviews[] | null;
  } | null;
};

import { Product } from "./API";

export type { Product, Review, GetProductQuery } from "./API";

export type GetProductResult = { getProduct: Product | undefined };

// export type ProductWithReviews = Product & { reviews?: { items: Review[] } };
export type ProductWithReviews = Product & {
  reviewCount: number;
};

export type ListProductsQueryWithReviews = {
  listProducts: {
    items: Product[];
    nextToken: string;
  };
};

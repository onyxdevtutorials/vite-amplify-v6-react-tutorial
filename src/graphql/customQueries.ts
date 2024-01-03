export const listProductsWithReviews = /* GraphQL */ `
  query ListProductsWithReviews(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        price
        createdAt
        updatedAt
        owner
        isArchived
        reviews {
          items {
            id
            rating
            content
            isArchived
            user {
              id
              username
              isArchived
            }
          }
          nextToken
        }
      }
      nextToken
    }
  }
`;

export const getProductWithReviews = /* GraphQL */ `
  query GetProductWithReviews($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      price
      isArchived
      reviews {
        items {
          id
          rating
          content
          isArchived
          createdAt
          updatedAt
          productReviewsId
          userReviewsId
          owner
          __typename
        }
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;

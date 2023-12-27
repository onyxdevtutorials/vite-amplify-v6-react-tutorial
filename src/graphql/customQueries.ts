export const listProductsWithReviews = /* GraphQL */ `
  query ListProducts(
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
        reviews {
          items {
            id
          }
          nextToken
        }
      }
      nextToken
    }
  }
`;

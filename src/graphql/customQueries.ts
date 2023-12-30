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

export const archiveProduct = /* GraphQL */ `
  mutation ArchiveProduct($id: ID!) {
    updateProduct(input: { id: $id, isArchived: true }) {
      id
      isArchived
    }
  }
`;

export const restoreProduct = /* GraphQL */ `
  mutation RestoreProduct($id: ID!) {
    updateProduct(input: { id: $id, isArchived: false }) {
      id
      isArchived
    }
  }
`;

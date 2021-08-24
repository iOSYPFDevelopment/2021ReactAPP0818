/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNote = /* GraphQL */ `
  query GetNote($id: ID!) {
    getNote(id: $id) {
      id
      image
      productChName
      productNo
      productEnName
      productSize
      ProductImageName
      createdAt
      updatedAt
    }
  }
`;
export const listNotes = /* GraphQL */ `
  query ListNotes(
    $filter: ModelNoteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        image
        productChName
        productNo
        productEnName
        productSize
        ProductImageName
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

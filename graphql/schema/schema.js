
export const graphQLSchema = `#graphql

type Query {
    hello: String

}

type Mutation {
    addPost(title: String!, content: String!): Post
}

type Post {
    title: String
    content: String
}
`;
    
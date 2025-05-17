
import { helloWord,newPost } from "../controllers/graphql.js";

export const graphQLResolver = {
    Query: {
        hello: helloWord,
    },
    Mutation: {
        addPost:newPost,
    },
};


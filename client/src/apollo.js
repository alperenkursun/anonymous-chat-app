import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} from "@apollo/client/core/index.js";
import { getMainDefinition } from "@apollo/client/utilities/index.js";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions/index.js";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;

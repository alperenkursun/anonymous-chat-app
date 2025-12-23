import { ApolloServer, gql } from "apollo-server-express";
import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";
import cors from "cors";

const options = {
  host: "127.0.0.1",
  port: 7379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

const typeDefs = gql`
  type Message {
    id: ID!
    text: String!
    sender: String!
    time: String!
  }
  type Query {
    messages: [Message]
  }
  type Mutation {
    sendMessage(text: String!, sender: String!): Message!
  }
  type Subscription {
    messageAdded: Message!
  }
`;

const resolvers = {
  Query: { messages: () => [] },
  Mutation: {
    sendMessage: (parent, { text, sender }) => {
      const newMessage = {
        id: Date.now().toString(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      pubsub.publish("MESSAGE_ADDED", { messageAdded: newMessage });
      return newMessage;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(["MESSAGE_ADDED"]),
    },
  },
};

async function startServer() {
  const app = express();
  app.use(cors());
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(4000, () => {
    console.log(`🚀 http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();

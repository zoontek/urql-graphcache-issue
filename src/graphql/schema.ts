import { makeExecutableSchema } from "@graphql-tools/schema";
import fs from "fs";
import path from "path";
import { Resolvers, Team } from "./resolvers";

const TEAM: Team = {
  id: "d39c2259-7ca2-45da-83cd-4cf0858754b9",
  name: "Urql",
  users: {
    pageInfo: {
      endCursor: "7382c81d-d61f-4266-a4e3-ded7172eb5dd",
      hasNextPage: false,
      startCursor: null,
      hasPreviousPage: false,
    },
    edges: [
      {
        cursor: "daf7761b-0542-47e2-a853-e976ef4463db",
        node: {
          id: "daf7761b-0542-47e2-a853-e976ef4463db",
          name: "Kurtis Hogan",
        },
      },
      {
        cursor: "384dd9ca-5284-4655-9cc1-418daa7cc4cc",
        node: {
          id: "384dd9ca-5284-4655-9cc1-418daa7cc4cc",
          name: "Marcus Allison",
        },
      },
      {
        cursor: "7382c81d-d61f-4266-a4e3-ded7172eb5dd",
        node: {
          id: "7382c81d-d61f-4266-a4e3-ded7172eb5dd",
          name: "Lyman Michael",
        },
      },
    ],
  },
};

const schemaFilePath = path.join(process.cwd(), "src/graphql/schema.gql");
const typeDefs = fs.readFileSync(schemaFilePath, "utf-8");

const resolvers: Resolvers = {
  PageInfo: {
    endCursor: (parent) => parent.endCursor,
    hasNextPage: (parent) => parent.hasNextPage,
    startCursor: (parent) => parent.endCursor,
    hasPreviousPage: (parent) => parent.hasNextPage,
  },

  Team: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
    users: (parent) => parent.users,
  },

  User: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
  },

  UsersConnectionEdge: {
    cursor: (parent) => parent.cursor,
    node: (parent) => parent.node,
  },

  UsersConnection: {
    pageInfo: (parent) => parent.pageInfo,
    edges: (parent) => parent.edges,
  },

  Query: {
    team: () => TEAM,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

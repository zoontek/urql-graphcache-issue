import { GraphQLError } from "@0no-co/graphql.web";
import { makeExecutableSchema } from "@graphql-tools/schema";
import fs from "fs";
import path from "path";
import { parsePaginationArgs } from "prisma-cursor-pagination";
import { prisma } from "../database/prisma";
import { Resolvers } from "./resolvers";

const schemaFilePath = path.join(process.cwd(), "src/graphql/schema.gql");
const typeDefs = fs.readFileSync(schemaFilePath, "utf-8");

const resolvers: Resolvers<{}> = {
  PageInfo: {
    endCursor: (parent) => parent.endCursor,
    hasNextPage: (parent) => parent.hasNextPage,
    startCursor: (parent) => parent.endCursor,
    hasPreviousPage: (parent) => parent.hasNextPage,
  },

  TeamsConnectionEdge: {
    cursor: (parent) => parent.cursor,
    node: (parent) => parent.node,
  },

  TeamsConnection: {
    pageInfo: (parent) => parent.pageInfo,
    edges: (parent) => parent.edges,
  },

  UsersConnectionEdge: {
    cursor: (parent) => parent.cursor,
    node: (parent) => parent.node,
  },

  UsersConnection: {
    pageInfo: (parent) => parent.pageInfo,
    edges: (parent) => parent.edges,
  },

  Team: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,

    users: async (parent, args) => {
      const { findManyArgs, toConnection } = parsePaginationArgs(args, {
        connectionName: "users",
      });

      const users = await prisma.user.findMany({
        ...findManyArgs,
        where: { team: { id: parent.id } },
      });

      return toConnection(users);
    },
  },

  User: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
  },

  Query: {
    team: async (_root, args) => {
      const team = await prisma.team.findFirst({
        where: { id: args.id },
      });

      if (team == null) {
        throw new GraphQLError("NOT_FOUND");
      }

      return team;
    },

    teams: async (_root, args) => {
      const { findManyArgs, toConnection } = parsePaginationArgs(args, {
        connectionName: "teams",
      });

      const teams = await prisma.team.findMany({
        ...findManyArgs,
      });

      return toConnection(teams);
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

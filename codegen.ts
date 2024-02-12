import type { CodegenConfig } from "@graphql-codegen/cli";
import { resolve } from "node:path";

const file = (path: string) => resolve(__dirname, path);

const config: CodegenConfig = {
  errorsOnly: true,
  overwrite: true,

  schema: file("./src/graphql/schema.gql"),

  hooks: {
    afterAllFileWrite: "prettier --write",
  },

  generates: {
    [file("./src/graphql/index.ts")]: {
      documents: file("./src/graphql/index.gql"),
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node",
        "typescript-urql-graphcache",
      ],
      config: {
        dedupeOperationSuffix: true,
        enumsAsTypes: true,
        nonOptionalTypename: true,
        preResolveTypes: true,
        skipTypename: false,
        defaultScalarType: "unknown",
        inlineFragmentTypes: "combine",
      },
    },

    [file("./src/graphql/resolvers.ts")]: {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        avoidOptionals: true,
        enumsAsTypes: true,
      },
    },

    [file("./src/graphql/introspection.json")]: {
      plugins: ["introspection"],
      config: { descriptions: false },
      hooks: { afterOneFileWrite: "yarn tsx scripts/cleanIntrospection.ts" },
    },
  },
};

export default config;

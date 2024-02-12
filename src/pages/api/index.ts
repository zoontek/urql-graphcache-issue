import { createYoga } from "graphql-yoga";
import { NextApiRequest, NextApiResponse } from "next";
import { schema } from "../../graphql/schema";

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({ graphqlEndpoint: "/api", schema });

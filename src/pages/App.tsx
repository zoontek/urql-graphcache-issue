import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { relayPagination } from "@urql/exchange-graphcache/extras";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Provider, createClient, fetchExchange, useQuery } from "urql";
import {
  GetTeamsDocument,
  GetUsersDocument,
  GraphCacheConfig,
} from "../graphql";
import schema from "../graphql/introspection.json";

export const client = createClient({
  url: "/api",
  fetchOptions: { next: { revalidate: 0 } },
  requestPolicy: "cache-and-network",
  exchanges: [
    devtoolsExchange,
    cacheExchange<GraphCacheConfig>({
      schema,

      resolvers: {
        Query: {
          teams: relayPagination({ mergeMode: "inwards" }),
        },
        Team: {
          users: relayPagination({ mergeMode: "inwards" }),
        },
      },
    }),
    fetchExchange,
  ],
});

const Users = ({ teamId }: { teamId: string }) => {
  const router = useRouter();
  const [after, setAfter] = useState<string | null>();

  const [{ fetching, data, error, stale }] = useQuery({
    query: GetUsersDocument,
    variables: { teamId, first: 5, after },
  });

  console.log(
    "fetching",
    fetching,
    "\n" + "stale",
    stale,
    "\n" + "users",
    data?.team.users?.edges,
  );

  if (fetching && data == null && error == null) {
    return <span>Initial fetching…</span>;
  }

  const users = data?.team.users;

  if (users == null || error != null) {
    return <span>Error</span>;
  }

  return (
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        onClick={() => {
          router.back();
        }}
      >
        ⬅️ Go back to Teams
      </button>

      <h1>Users</h1>

      {users.edges.map(({ node }) => (
        <div key={node.id}>
          <span>{node.name}</span>

          <code>
            <pre>{JSON.stringify(node, null, 2)}</pre>
          </code>
        </div>
      ))}

      <button
        disabled={!users.pageInfo.hasNextPage}
        onClick={() => {
          setAfter(users.pageInfo.endCursor);
        }}
      >
        Fetch next teams
      </button>
    </div>
  );
};

const Teams = () => {
  const [after, setAfter] = useState<string | null>();

  const [{ fetching, data, error }] = useQuery({
    query: GetTeamsDocument,
    variables: { first: 5, after },
  });

  if (fetching && data == null && error == null) {
    return <span>Initial fetching…</span>;
  }
  if (data == null || error != null) {
    return <span>Error</span>;
  }

  return (
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>Teams</h1>

      {data.teams.edges.map(({ node }) => (
        <div key={node.id}>
          <Link href={`/?team=${node.id}`}>{node.name}</Link>

          <code>
            <pre>{JSON.stringify(node, null, 2)}</pre>
          </code>
        </div>
      ))}

      <button
        disabled={!data.teams.pageInfo.hasNextPage}
        onClick={() => {
          setAfter(data.teams.pageInfo.endCursor);
        }}
      >
        Fetch next teams
      </button>
    </div>
  );
};

const App = () => {
  const { query } = useRouter();
  const team = Array.isArray(query.team) ? query.team[0] : query.team;
  return team ? <Users teamId={team} /> : <Teams />;
};

export default () => (
  <Provider value={client}>
    <App />
  </Provider>
);

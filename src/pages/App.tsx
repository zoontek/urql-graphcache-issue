import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { relayPagination } from "@urql/exchange-graphcache/extras";
import { useState } from "react";
import { Provider, createClient, fetchExchange, useQuery } from "urql";
import { TEAM_ID } from "../constants/ids";
import {
  GetTeamDocument,
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
        Team: {
          users: relayPagination({ mergeMode: "inwards" }),
        },
      },
    }),
    fetchExchange,
  ],
});

const Users = () => {
  const [after, setAfter] = useState<string | null>();

  const [{ fetching, data, error, stale }] = useQuery({
    query: GetUsersDocument,
    variables: {
      first: 10,
      after,
      teamId: TEAM_ID,
    },
  });

  const users = data?.team.users;

  console.log(
    "fetching",
    fetching,
    "\n" + "stale",
    stale,
    "\n" + "users",
    users?.edges,
  );

  if (fetching && data == null && error == null) {
    return <span>Initial fetching…</span>;
  }

  if (users == null || error != null) {
    return <span>Error</span>;
  }

  return (
    <>
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
        Fetch next users
      </button>
    </>
  );
};

const App = () => {
  const [usersShown, setUsersShown] = useState(false);

  const [{ fetching, data, error }] = useQuery({
    query: GetTeamDocument,
    variables: {
      id: TEAM_ID,
    },
  });

  const team = data?.team;

  if (fetching) {
    return <span>Fetching…</span>;
  }
  if (error != null) {
    return <span>Error: {error.message}</span>;
  }
  if (team == null) {
    return <span>Team not found</span>;
  }

  return (
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>
        Team {team.name} ({team.id})
      </h1>

      {usersShown ? (
        <Users />
      ) : (
        <button
          onClick={() => {
            setUsersShown(true);
          }}
        >
          Show users
        </button>
      )}
    </div>
  );
};

export default () => (
  <Provider value={client}>
    <App />
  </Provider>
);

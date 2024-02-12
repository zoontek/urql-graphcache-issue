import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { relayPagination } from "@urql/exchange-graphcache/extras";
import { useState } from "react";
import { Provider, createClient, fetchExchange, useQuery } from "urql";
import {
  GetTeamDocument,
  GetUsersDocument,
  GraphCacheConfig,
} from "../graphql";
import schema from "../graphql/introspection.json";

export const client = createClient({
  url: "/api",
  fetchOptions: { next: { revalidate: 0 } },
  requestPolicy: "cache-first",
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
  const [{ fetching, data, error, stale }] = useQuery({
    query: GetUsersDocument,
    variables: {
      teamId: "urql",
      first: 10,
    },
  });

  console.log(
    "fetching",
    fetching,
    "\n" + "stale",
    stale,
    "\n" + "users",
    data?.team.users,
  );

  if (fetching) {
    return <span>Loading…</span>;
  }
  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <code>
      <pre>{JSON.stringify(data?.team, null, 2)}</pre>
    </code>
  );
};

const App = () => {
  const [{ fetching, data, error }] = useQuery({
    query: GetTeamDocument,
    variables: { teamId: "urql" },
  });

  const [usersVisible, setUsersVisible] = useState(false);

  if (fetching) {
    return <span>Loading…</span>;
  }
  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <code>
        <pre>{JSON.stringify(data?.team, null, 2)}</pre>
      </code>

      {usersVisible ? (
        <Users />
      ) : (
        <button onClick={() => setUsersVisible(true)}>Fetch team users</button>
      )}
    </div>
  );
};

export default () => (
  <Provider value={client}>
    <App />
  </Provider>
);

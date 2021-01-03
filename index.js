import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';
import { ApolloClient, InMemoryCache } from "@apollo/client";

const httpLink = createHttpLink({});
const wsType = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
const wsLink = new WebSocketLink({
  uri: `${wsType}//${window.location.host}/graphql`,
  options: {
    reconnect: true,
  },
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return ({
      headers: {
        ...headers,
        'x-token': token,
      },
    });
  }
  return (headers);
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
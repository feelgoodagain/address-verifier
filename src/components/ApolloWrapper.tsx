'use client';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';


function createApolloClient() {
    return new ApolloClient({
        link: new HttpLink({
            uri: "/api/graphql",
        }),
        cache: new InMemoryCache(),
    });
}

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return <ApolloProvider client={createApolloClient()}>{children}</ApolloProvider>;
}
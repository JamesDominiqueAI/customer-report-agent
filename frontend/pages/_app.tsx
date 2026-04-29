import type { AppProps } from "next/app";
import Head from "next/head";

import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MCP Customer Report Agent</title>
        <meta
          name="description"
          content="An MCP-powered chatbot for summarizing customer complaints."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

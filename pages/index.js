import { useEffect, useState } from "react";

import clientPromise from "../lib/mongodb";

import Head from "next/head";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import theme from "../lib/theme";

import { Typography, Grid } from "@mui/material";

import Header from "../components/header";
import Footer from "../components/footer";

import { ethers } from "ethers";

import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets";
import { init, useConnectWallet, useAccountCenter } from "@web3-onboard/react";

const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`;

const injected = injectedModule({
  filter: {
    [ProviderLabel.Detected]: false,
  },
});

init({
  wallets: [injected],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: MAINNET_RPC_URL,
    },
  ],
  appMetadata: {
    name: "🧹🧹🧹",
    icon: `https://${process.env.NEXT_PUBLIC_PROD_HOST}/favicon-32x32.png`,
    description: "🧹🧹🧹",
  },
});

export default function Home({ isConnected }) {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const updateAccountCenter = useAccountCenter();
  updateAccountCenter({ enabled: false });

  const [keyPair, setKeyPair] = useState(null);

  const [uuid, setUuid] = useState(undefined);
  const [introduction, setIntroduction] = useState(undefined);

  const [provider, setProvider] = useState(null);
  const [signature, setSignature] = useState(null);

  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!uuid) {
      const newUuid = crypto.randomUUID();
      setUuid(newUuid);
    }

    if (!keyPair)
      window.crypto.subtle
        .generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["encrypt", "decrypt"]
        )
        .then((res) => setKeyPair(res));
  }, []);

  useEffect(() => {
    if (uuid) {
      fetch("/api/introduction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: uuid,
        }),
      })
        .then((res) => res.json())
        .then((json) => setIntroduction(json.introduction));
    }
  }, [uuid]);

  useEffect(() => {
    if (wallet?.provider) {
      setProvider(new ethers.providers.Web3Provider(wallet.provider, "any"));
    }
  }, [wallet]);

  useEffect(() => {
    if (provider && !signature) {
      const signer = provider.getSigner();
      signer.signMessage(introduction.message).then((res) => {
        setSignature({
          signature: res,
          provider: provider.provider.currentAddress,
        });
      });
    }
  }, [provider]);

  useEffect(() => {
    if (introduction && introduction.message && signature && keyPair) {
      window.crypto.subtle
        .exportKey("jwk", keyPair.publicKey)
        .then((exportKey) =>
          fetch("/api/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uuid: uuid,
              message: introduction.message,
              wallet: signature.provider,
              signature: signature.signature,
              publicKey: JSON.stringify(exportKey),
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              window.crypto.subtle
                .importKey(
                  "jwk",
                  JSON.parse(json.server),
                  { name: "RSA-OAEP", hash: "SHA-256" },
                  true,
                  ["encrypt"]
                )
                .then((importKey) => {
                  setSession({
                    server: importKey,
                    apiKey: Uint8Array.from(atob(json.apiKey), (c) =>
                      c.charCodeAt(0)
                    ),
                  });
                });
            })
        );
    }
  }, [signature]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title></title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline enableColorScheme />

      <Header props={{ connect, disconnect, connecting, wallet }} />

      {session && Object.keys(session).length > 0 ? (
        <Footer
          props={{ keyPair: keyPair, session: session, signature: signature }}
        />
      ) : (
        <Grid container spacing={2} minHeight={160}>
          <Grid
            item
            xs
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h6" gutterBottom>
              {provider && session && Object.keys(session).length == 0
                ? "Wallet not authorized"
                : provider
                ? "Please sign message to complete verification"
                : "Please connect to begin"}
            </Typography>
          </Grid>
        </Grid>
      )}
    </ThemeProvider>
  );
}

export async function getServerSideProps(context) {
  try {
    await clientPromise;
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true, test: 1 },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}

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

import { Typography, Grid, Card, Box } from "@mui/material";

import Header from "../components/header";
import Footer from "../components/footer";

import crypto from "crypto";

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
    name: process.env.NEXT_PUBLIC_TITLE,
    icon: `https://${process.env.NEXT_PUBLIC_PROD_HOST}/favicon-32x32.png`,
    description: process.env.NEXT_PUBLIC_DESCRIPTION,
  },
});

export default function Home(props) {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const updateAccountCenter = useAccountCenter();
  updateAccountCenter({ enabled: false });

  const [keyPair, setKeyPair] = useState(null);

  const [config, setConfig] = useState({ title: " ", description: " " });
  const [uuid, setUuid] = useState(undefined);
  const [introduction, setIntroduction] = useState(undefined);

  const [provider, setProvider] = useState(null);
  const [signature, setSignature] = useState(null);

  const [session, setSession] = useState(null);

  useEffect(() => {
    if (props.config) setConfig(JSON.parse(props.config));

    if (!uuid)
      props && props.clientId
        ? setUuid(props.clientId)
        : setUuid(window.crypto.randomUUID());

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
        <title>{config ? config.title : ""}</title>
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
          props={{
            config: config,
            keyPair: keyPair,
            session: session,
            signature: signature,
          }}
        />
      ) : (
        <Box sx={{margin: 5}}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h6" gutterBottom>
                {provider && session && Object.keys(session).length == 0
                  ? config
                    ? config.noauth
                    : " "
                  : provider
                  ? config
                    ? config.onauth
                    : " "
                  : config
                  ? config.preauth
                  : " "}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Card raised sx={{ padding: 3, marginTop: 2 }}>
                <Typography variant="p" gutterBottom>
                  {config.about}
                </Typography>
                <br />
                <br />
                <Typography variant="p" gutterBottom>
                  {`${config.clientidentifier}${props.clientId}`}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </ThemeProvider>
  );
}

export async function getServerSideProps(context) {
  try {
    const client = await clientPromise;
    const db = await client.db("verification");
    const collection = await db.collection("messages");

    const config = await collection.findOne({ name: "config" });

    const clientId = crypto.randomUUID();

    await collection.insertOne({
      _id: clientId,
      message: `${config.message}${clientId}`,
      created: new Date().valueOf(),
    });

    return {
      props: {
        isConnected: true,
        config: JSON.stringify(config),
        clientId: clientId,
        message: `${config.message}${clientId}`,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}

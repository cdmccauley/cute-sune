import { useCallback, useEffect, useState } from "react";

import clientPromise from "../lib/mongodb";

import Head from "next/head";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import theme from "../lib/theme";

import {
  Container,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Monitor from "../components/monitor";
import Header from "../components/header";
import Footer from "../components/footer";

import { ethers } from "ethers";
import { verifyMessage } from "ethers/lib/utils.js";

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
    name: "cute-sune",
    icon: "https://cute-sune.vercel.app/favicon.png",
    description: "...equipped for multiplayer",
  },
});

export default function Home({ isConnected }) {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const updateAccountCenter = useAccountCenter();
  updateAccountCenter({ enabled: false });

  const [uuid, setUuid] = useState(undefined);
  const [introduction, setIntroduction] = useState(undefined);

  const [provider, setProvider] = useState(null);
  const [signature, setSignature] = useState(null);

  const [session, setSession] = useState(null);

  // TODO: safely persist uuid on client to reduce db messages
  useEffect(() => {
    if (!uuid) {
      const newUuid = crypto.randomUUID();
      setUuid(newUuid);
    }
  }, []);

  useEffect(() => {
    if (uuid) {
      console.log(uuid);
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
    if (introduction && introduction.message && signature) {
      console.log({
        signature: signature,
        "created by": verifyMessage(introduction.message, signature.signature),
      });
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
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          // check res for nftdata
          console.log(json);
          setSession(json);
        });
    }
  }, [signature]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline enableColorScheme />

      <Header props={{ connect, disconnect, connecting, wallet }} />

      {session && Object.keys(session).length > 0 ? (
        <Footer />
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

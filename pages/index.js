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

import { Container, Button, Card, CardContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Monitor from "../components/monitor";

import { ethers } from "ethers";
import { verifyMessage } from "ethers/lib/utils.js";

import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets";
import { init, useConnectWallet } from "@web3-onboard/react";

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

  const [provider, setProvider] = useState(null);
  const [signature, setSignature] = useState(null);

  const [uuid, setUuid] = useState(undefined);
  const [introduction, setIntroduction] = useState(undefined);

  // send server expected wallet, server generate { expected: message } then store and send
  // client gets message that triggers signature
  // client sends signature to

  // stores and sends message expected is key
  // send server sig, server checks stored message

  // dont send them data unless they can send me the sig

  ////

  // endpoints for message? /api/[message], does the message exist on my server?
  // endpoints for wallet? /api/[wallet]
  // endpoints for signature? /api/[signature]

  // onload i create and store your client verify message then send to you (has ttl, every call clears old)
  // you set client verify as your remote message and sign it
  // tell me wallet, remote message and sig; if your message exists on file and sig verified and wallet holds, clear message, store and send new api key
  // give api keys a ttl and build a clearing mechanism into the endpoints
  // endpoint can check a timestamp of last clear

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

  // useEffect(() => {
  //   console.log(introduction);
  // }, [introduction]);

  useEffect(() => {
    if (wallet?.provider) {
      setProvider(new ethers.providers.Web3Provider(wallet.provider, "any"));
    }
  }, [wallet]);

  useEffect(() => {
    if (provider && !signature) {
      const signer = provider.getSigner();
      console.log("signer", wallet);
      signer.signMessage(introduction.message).then((res) => {
        setSignature(res);
      });
    }
  }, [provider]);

  useEffect(() => {
    if (introduction && introduction.message && signature)
      console.log(
        "SIGNATURE",
        signature,
        verifyMessage(introduction.message, signature)
      );
  }, [signature]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline enableColorScheme />

      <Container sx={{ mt: 3 }}>
        <Card raised={true}>
          <CardContent>
            <Button
              disabled={connecting}
              variant="outlined"
              onClick={() => (wallet ? disconnect(wallet) : connect())}
            >
              {connecting ? "connecting" : wallet ? "disconnect" : "connect"}
            </Button>
          </CardContent>
        </Card>
      </Container>
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

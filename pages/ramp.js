import React, { useEffect, useState } from "react";

import Head from "next/head";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import theme from "../lib/theme";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

import {
  Container,
  Stack,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CardHeader,
  Box,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";

import Display from "../components/display";
import Monitor from "../components/monitor";
import History from "../components/history";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import useHistory from "../data/use-history";

export default function Ramp() {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");

  const [limitMethod, setLimitMethod] = useState("INDEX");

  const [userInterval, setUserInterval] = useState(60000); // 60s

  const { parseData, parseError, parseLoading } = useParse({ url: gsURL }); // look a tprops

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { historyData, historyError, historyLoading } = useHistory(
    loopringData && loopringData.loopringNftInfo
      ? { nft: loopringData.loopringNftInfo.nftData } // passing in the whole nftData
      : undefined
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData, userInterval } : null
  );

  useEffect(() => {
    const url = new URL(window.location).searchParams.get("url");
    if (url) setGSURL(url);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline enableColorScheme />
      <main>
        <Container sx={{ minWidth: "100%" }}>
          <Stack sx={{ mt: 3, mb: 2 }} spacing={2}>
            <Card raised={true}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      size="small"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      id="outlined-basic"
                      label="URL"
                      variant="outlined"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setGSURL(inputValue);
                        setInputValue("");
                      }}
                    >
                      Load
                    </Button>
                    {ordersData && ordersData[0] ? (
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={limitMethod == "INDEX"}
                              onChange={(e) => {
                                if (e.target.checked) setLimitMethod("INDEX");
                              }}
                            />
                          }
                          label="Index"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={limitMethod == "PERCENT"}
                              onChange={(e) => {
                                if (e.target.checked) setLimitMethod("PERCENT");
                              }}
                            />
                          }
                          label="Percent"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={limitMethod == "MAX"}
                              onChange={(e) => {
                                if (e.target.checked) setLimitMethod("MAX");
                              }}
                            />
                          }
                          label="Max"
                        />
                      </FormGroup>
                    ) : undefined}
                  </Box>
                }
                action={
                  <IconButton
                    aria-label="remove"
                    onClick={() => console.log("menu?")}
                  >
                    <MoreVertIcon sx={{ height: 24, width: 24 }} />
                  </IconButton>
                }
              />
            </Card>

            {gsURL ? (
              <Card raised={true}>
                <Monitor
                  props={{
                    url: gsURL,
                    index: 0,
                  }}
                />
              </Card>
            ) : undefined}

            {ordersData && historyData ? (
              <Card raised={true} sx={{ p: 2 }}>
                <CardContent sx={{ display: "flex", gap: 4 }}>
                  {historyData ? (
                    <Box sx={{ flexGrow: 0, width: "50%" }}>
                      <Typography>{`Discovered Sales (${
                        historyData.filter(
                          (o) =>
                            o.transaction.orderA &&
                            (parseFloat(o.transaction.orderA.amountS) * 1e-18) /
                              parseFloat(o.transaction.orderA.amountB) <
                              3
                        ).length
                      })`}</Typography>
                      <History props={{ history: historyData }} />
                    </Box>
                  ) : undefined}
                  {ordersData && ordersData[0] ? (
                    <Box sx={{ flexGrow: 0, width: "50%" }}>
                      <Typography>{`Listings (${
                        limitMethod == "INDEX"
                          ? "First 10"
                          : limitMethod == "PERCENT"
                          ? "Up to 250% current price"
                          : "All"
                      })`}</Typography>
                      <Display
                        props={{
                          ordersData: ordersData,
                          limitMethod: limitMethod,
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography>{`Listings (0)`}</Typography>
                  )}
                </CardContent>
              </Card>
            ) : undefined}

            {/* {ordersData && ordersData[0] ? (
              <Card raised={true} sx={{ p: 2 }}>
                {ordersData && ordersData[0] ? (
                  <Display
                    props={{ ordersData: ordersData, limitMethod: limitMethod }}
                  />
                ) : undefined}
              </Card>
            ) : undefined}

            {historyData ? (
              <Card raised={true} sx={{ p: 2 }}>
                <History props={{ history: historyData }} />
              </Card>
            ) : (
              "undefined"
            )} */}
          </Stack>
        </Container>
      </main>
    </ThemeProvider>
  );
}

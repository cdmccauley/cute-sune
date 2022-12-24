import React, { useEffect, useState } from "react";

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
  Stack,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CardHeader,
  Box,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Monitor from "../components/monitor";

export default function MonitorBoard() {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);

  const [childMetaData, setChildMetaData] = useState({});
  const [childComponents, setChildComponents] = useState([]);

  const [soundOff, setSoundOff] = useState(false);
  const [notify, setNotify] = useState(false);

  // useEffect(() => {
  //   if (!("Notification" in window) || Notification.permission === "granted") setNotify(true)
  // })

  // useEffect(() => {
  //   if (soundOff) {
  //     console.log("soundOff");
  //     setSoundOff(false);
  //   }
  // }, [soundOff]);

  useEffect(() => {
    if (localStorage.getItem("gsURLs"))
      setGSURLs(JSON.parse(localStorage.getItem("gsURLs")));
    if (!("Notification" in window) || Notification.permission === "granted")
      setNotify(true);
  }, []);

  useEffect(() => {
    if (
      new RegExp("https://nft.gamestop.com/token/0x[a-zA-Z0-9]*/0x").test(
        gsURL
      ) &&
      !gsURLs.includes(gsURL)
    ) {
      setGSURLs([...gsURLs, gsURL]);
      localStorage.setItem("gsURLs", JSON.stringify([...gsURLs, gsURL]));
    } else {
      // invalid or existing, alert
    }
    setInputValue("");
    setGSURL("");
  }, [gsURL]);

  useEffect(() => {
    setChildComponents(
      gsURLs.map((url, index) => (
        <Monitor
          props={{
            url,
            setSoundOff,
            gsURLs,
            setGSURLs,
            index,
            childMetaData,
            setChildMetaData,
          }}
          key={index}
        />
      ))
    );
  }, [gsURLs]);

  useEffect(() => {
    if (
      gsURLs.toString() !=
      gsURLs
        .sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        .toString()
    ) {
      localStorage.setItem(
        "gsURLs",
        JSON.stringify(
          gsURLs.sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        )
      );
      setGSURLs(
        Array.from(
          gsURLs.sort((a, b) => childMetaData[b].val - childMetaData[a].val)
        )
      );
    }
  }, [childMetaData]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline enableColorScheme />
      <main>
        <Container>
          <Stack sx={{ mt: 3 }} spacing={2}>
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
                      }}
                    >
                      Add
                    </Button>
                    {!notify ? (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          Notification.requestPermission().then(
                            (permission) => {
                              // if (permission === "granted") setNotify(true);
                            }
                          );
                        }}
                      >
                        Notify
                      </Button>
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
              {/* <CardContent sx={{ pt: 0 }}>
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
                    Notification.requestPermission().then((permission) => {
                      // if (permission === "granted") setNotify(true);
                    });
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    Notification.requestPermission().then((permission) => {
                      // if (permission === "granted") setNotify(true);
                    });
                  }}
                >
                  Notify
                </Button>
              </CardContent> */}
            </Card>
            {childComponents.map((childComponent) => childComponent)}
          </Stack>
        </Container>
      </main>
    </ThemeProvider>
  );
}

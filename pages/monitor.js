import React, { useEffect, useState } from "react";

import Head from "next/head";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import theme from "../lib/theme";

import { Container, Stack } from "@mui/material";

import Monitor from "../components/monitor";

export default function MonitorBoard() {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);
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
          props={{ url, setSoundOff, gsURLs, setGSURLs, index }}
          key={index}
        />
      ))
    );
  }, [gsURLs]);

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
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button
              type="submit"
              onClick={() => {
                setGSURL(inputValue);
              }}
            >
              Submit
            </button>

            <button
              type="submit"
              onClick={() => {
                Notification.requestPermission().then((permission) => {
                  // if (permission === "granted") setNotify(true);
                });
              }}
              hidden={notify}
            >
              Notify
            </button>
          </div>
          <Stack spacing={2}>
            {childComponents.map((childComponent) => childComponent)}
          </Stack>
        </Container>
      </main>
    </ThemeProvider>
  );
}

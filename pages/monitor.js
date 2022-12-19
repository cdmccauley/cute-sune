import React, { useEffect, useState } from "react";

import Head from "next/head";

import Monitor from "../components/monitor";

export default function MonitorBoard() {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);
  const [childComponents, setChildComponents] = useState([]);

  const [soundOff, setSoundOff] = useState(false);
  // const [notify, setNotify] = useState(false);

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
    if (localStorage.getItem('gsURLs')) setGSURLs(JSON.parse(localStorage.getItem('gsURLs')))
  }, [])

  useEffect(() => {
    if (
      new RegExp("https://nft.gamestop.com/token/0x[a-zA-Z0-9]*/0x").test(
        gsURL
      ) &&
      !gsURLs.includes(gsURL)
    ) {
      setGSURLs([...gsURLs, gsURL]);
      localStorage.setItem('gsURLs', JSON.stringify([...gsURLs, gsURL]))
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
    <>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <div id="controls">
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
          >
            Notify
          </button>
        </div>

        {childComponents.map((childComponent) => childComponent)}
      </main>
      <style jsx>{``}</style>
      <style jsx global>
        {`
          body {
            background-color: #333;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
              Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
              sans-serif;
            padding: 5px;
          }
          main {
            color: white;
          }
          a {
            color: white;
          }
          .row {
            display: flex;
            flex-wrap: nowrap;
            gap: 10px;
            // justify-content: space-around;
            align-items: flex-start;
          }
          img {
            // max-width: 147px;
            max-width: 105px;
            margin: 10px 0 0 0;
            border-radius: 5px;
          }
          h3 {
            margin: 5px 0 0 0;
          }
          p {
            margin: 0;
          }
          .remove {
            flex-grow: 1;
            display: flex;
            justify-content: flex-end;
            padding-top: 10px;
          }
          #controls {
            margin-bottom: 5px;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </>
  );
}

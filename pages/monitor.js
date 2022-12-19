import React, { useEffect, useState } from "react";

import Head from "next/head";

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
    <>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <div id="controls" className="row">
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

        {childComponents.map((childComponent) => childComponent)}
      </main>
      <style jsx>{``}</style>
      <style jsx global>
        {`
        html {
          background-color: #ff3cac;
            background-image: linear-gradient(
              225deg,
              #ff3cac 0%,
              #784ba0 50%,
              #2b86c5 100%
            );
            height: 100%;
        }
          body {
            

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
            background-color: #333;
            display: flex;
            flex-wrap: nowrap;
            gap: 10px;
            // justify-content: space-around;
            align-items: flex-start;

            padding: 10px 20px;
            border-radius: 5px;
            margin-bottom: 15px;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
              0 6px 20px 0 rgba(0, 0, 0, 0.19);
          }
          img {
            // max-width: 147px;
            max-width: 105px;
            margin: 10px 0 35px 0;
            border-radius: 5px;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
              0 6px 20px 0 rgba(0, 0, 0, 0.19);
          }
          h3 {
            margin: 5px 0 0 0;
            text-shadow: 2px 2px 2px #111;
          }
          p {
            margin: 0;
            text-shadow: 2px 2px 2px #222;
          }
          .remove {
            flex-grow: 1;
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
            gap: 20px;
            padding-top: 10px;
          }
          #controls {
            margin-bottom: 15px;
          }
          .info {
            overflow: hidden;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </>
  );
}

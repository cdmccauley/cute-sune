import React, { useEffect, useState } from "react";

import Head from "next/head";

import MonitorRow from "../components/monitor-row";

export default function MyForm() {
  const [inputValue, setInputValue] = useState("");
  const [gsURL, setGSURL] = useState("");
  const [gsURLs, setGSURLs] = useState([]);
  const [childComponents, setChildComponents] = useState([]);

  const [soundOff, setSoundOff] = useState(false);

  useEffect(() => {
    if (soundOff) {
      console.log("soundOff");
      setSoundOff(false);
    }
  }, [soundOff]);

  useEffect(() => {
    if (gsURL != "" && !gsURLs.includes(gsURL)) {
      setGSURLs([...gsURLs, gsURL]);
    } else {
      // blank or existing, alert
    }
    setInputValue("");
    setGSURL("");
  }, [gsURL]);

  useEffect(() => {
    setChildComponents(
      gsURLs.map((url, index) => (
        <MonitorRow
          props={{ url, setSoundOff, gsURLs, setGSURLs, index }}
          key={index}
        />
      ))
    );
  }, [gsURLs]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setGSURL(inputValue);
  };

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

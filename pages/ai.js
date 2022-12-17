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
    if (gsURL != "") {
      setGSURLs([...gsURLs, gsURL]);
      setInputValue("");
    }
  }, [gsURL]);

  useEffect(() => {
    setChildComponents(
      gsURLs.map((url) => (
        <MonitorRow props={{ url, setSoundOff }} key={gsURLs.indexOf(url)} />
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
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>

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
            max-height: 105px;
            margin-top: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </>
  );
}

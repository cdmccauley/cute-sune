import React, { useState, useEffect } from "react";

import Head from "next/head";
import clientPromise from "../lib/mongodb";

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import chartTrendline from "chartjs-plugin-trendline";

export default function Home({ isConnected }) {
  const [gsInput, setGsInput] = useState(undefined);
  const [contractToken, setContractToken] = useState(undefined);
  const [nft, setNft] = useState(undefined);
  const [info, setInfo] = useState(undefined);
  const [history, setHistory] = useState(undefined);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (contractToken) {
      fetch(
        `/api/loopring?key=equipped&contract=${contractToken.contract}&token=${contractToken.token}`
      )
        .then((res) => res.json())
        .then((payload) => {
          setNft(payload.loopring);
          setInfo(payload.metaData);
        });
    }
  }, [contractToken]);

  useEffect(() => {
    if (nft) {
      const interval = setInterval(() => {
        fetch(`/api/history?key=equipped&nft=${nft}`)
          .then((res) => res.json())
          .then((payload) =>
            setHistory(
              payload
                .filter(
                  (sale) =>
                    sale.transaction.orderA &&
                    sale.transaction.orderA.amountS < 2000000000000000000
                )
                .reverse()
            )
          );
      }, 300000);
      fetch(`/api/history?key=equipped&nft=${nft}`)
        .then((res) => res.json())
        .then((payload) =>
          setHistory(
            payload
              .filter(
                (sale) =>
                  sale.transaction.orderA &&
                  sale.transaction.orderA.amountS < 2000000000000000000
              )
              .reverse()
          )
        );
      return () => clearInterval(interval);
    }
  }, [nft]);

  useEffect(() => {
    if (history) {
      setLoading(false);
    }
  }, [history]);

  const start = () => {
    setLoading(true);
    fetch(`/api/parse?key=equipped&gs=${gsInput}`)
      .then((res) => res.json())
      .then((payload) => setContractToken(payload));
  };

  if (isLoading)
    return (
      <div>
        <Head>
          <title>"equipped for multiplayer..."</title>
          <link rel="icon" href="/favicon.png" />
        </Head>

        <main>
          <p>Loading...</p>
        </main>

        <style jsx>
          {`
            .chart {
              width: 80%;
            }
          `}
        </style>
        <style jsx global>
          {`
            html,
            body {
              background-color: #333;
              padding: 0;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>
      </div>
    );

  if (!history)
    return (
      <div>
        <Head>
          <title>"equipped for multiplayer..."</title>
          <link rel="icon" href="/favicon.png" />
        </Head>

        <main>
          <input
            type="text"
            onChange={(e) => setGsInput(e.target.value)}
          ></input>
          <input type="button" value="go" onClick={() => start()}></input>
        </main>

        <style jsx>
          {`
            .chart {
              width: 80%;
            }
          `}
        </style>
        <style jsx global>
          {`
            html,
            body {
              background-color: #333;
              padding: 0;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>
      </div>
    );

  // if (info) console.log(info);

  if (history) {
    // console.log('maths', 2000000000000000000 * 1e-18)

    // console.log('history', history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < txAmountCeiling))

    // prevents any tx over 2 from showing
    // not sure how to tell what currency was used for tx
    // idea is to allow any tx up to 2 eth to show

    const labels = Array.from(history).map((label) =>
      new Date(label.createdAt).toLocaleString()
    );

    const data = {
      labels: labels,
      datasets: [
        {
          label: info ? info.name : "NFT Name Not Found",
          backgroundColor: "black",
          borderColor: "white",
          data: history.map((sale) =>
            sale.transaction.orderA
              ? (parseFloat(sale.transaction.orderA.amountS) * 1e-18) /
                parseFloat(sale.transaction.orderA.amountB)
              : 0
          ),
          trendlineLinear: {
            colorMin: "green",
            colorMax: "red",
            lineStyle: "line",
            width: 2,
            projection: false,
          },
        },
      ],
    };

    return (
      <div className="container">
        <Head>
          <title>"equipped for multiplayer..."</title>
          <link rel="icon" href="/favicon.png" />
        </Head>
        <main>
          <input
            type="text"
            onChange={(e) => setGsInput(e.target.value)}
          ></input>
          <input type="button" value="go" onClick={() => start()}></input>
          <div className="row">
            <div id="info">
              <a href={gsInput} target="_blank">
                <p>{info ? info.name : "NFT Name Not Found"}</p>
                <img
                  src={`https://www.gstop-content.com/ipfs/${
                    info ? info.image.match(/(?<=.{7}).+/i) : undefined
                  }`}
                />
              </a>
            </div>
            <Line
              id="chart"
              data={data}
              plugins={[chartTrendline]}
              options={{
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          <p>
            * DATA INACCURATE, OUTDATED, NOT COMPLETE AND DOES NOT CONSTITUTE
            ANY TYPE OF FINANCIAL ADVICE.
          </p>
        </main>

        <style jsx>{``}</style>
        <style jsx global>
          {`
            html,
            body {
              background-color: #333;
              padding: 10px;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                sans-serif;
            }
            main {
              color: white;
              max-width: 80vw;
            }
            a {
              color: white;
            }
            .row {
              display: flex;
              flex-wrap: nowrap;
              gap: 20px;
            }
            #info {
              min-width: 147px;
              flex: 50%;
            }
            img {
              max-width: 147px;
            }
            #chart {
              flex: 50%;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>
      </div>
    );
  }
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
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}

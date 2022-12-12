import React, { useState, useEffect } from "react";

import Head from "next/head";
import clientPromise from "../lib/mongodb";

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import chartTrendline from "chartjs-plugin-trendline";
import "chartjs-adapter-date-fns";

export default function ChartPage({ isConnected }) {
  const [gsInput, setGsInput] = useState(undefined);
  const [contractToken, setContractToken] = useState(undefined);
  const [nft, setNft] = useState(undefined);
  const [info, setInfo] = useState(undefined);
  const [nftId, setNftId] = useState(undefined);
  const [orders, setOrders] = useState(undefined);
  const [history, setHistory] = useState(undefined);
  const [isLoading, setLoading] = useState(false);

  const [nftData, setNftData] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [holders, setHolders] = useState(undefined);

  useEffect(() => {
    if (contractToken) {
      fetch(
        `/api/loopring?key=equipped&contract=${contractToken.contract}&token=${contractToken.token}`
      )
        .then((res) => res.json())
        .then((payload) => {
          setNftId(payload.nftId);
          setNft(payload.loopring);
          setInfo(payload.metaData);
          // adding prior to hookup
          setLoading(false);
        });
    }
  }, [contractToken]);

  useEffect(() => {
    if (nft) {
      fetch(`/api/nft_data`)
        .then((res) => res.json())
        .then((nft_data) => setNftData(nft_data));
      //       const interval = setInterval(() => {
      //         fetch(`/api/history?key=equipped&nft=${nft}`)
      //           .then((res) => res.json())
      //           .then((payload) =>
      //             setHistory(
      //               payload
      //                 .filter(
      //                   (sale) =>
      //                     sale.transaction.orderA &&
      //                     sale.transaction.orderA.amountS < 4000000000000000000
      //                 )
      //                 .reverse()
      //             )
      //           );
      //       }, 300000);
      //       fetch(`/api/history?key=equipped&nft=${nft}`)
      //         .then((res) => res.json())
      //         .then((payload) =>
      //           setHistory(
      //             payload
      //               .filter(
      //                 (sale) =>
      //                   sale.transaction.orderA &&
      //                   sale.transaction.orderA.amountS < 4000000000000000000
      //               )
      //               .reverse()
      //           )
      //         );
      //       return () => clearInterval(interval);
    }
  }, [nft]);

  useEffect(() => {
    if (nftData) {
      console.log("nftData", nftData);
      fetch(`/api/account`)
        .then((res) => res.json())
        .then((account) => setAccount(account));
    }
  }, [nftData]);

  useEffect(() => {
    if (account) {
      console.log("account", account);
      fetch(`/api/holders`)
        .then((res) => res.json())
        .then((holders) => setHolders(holders));
    }
  }, [account]);

  useEffect(() => {
    if (holders) {
      console.log(
        "holders",
        holders.holders.nftHolders.map((h) => h.accountId)
      );
      //  https://swr.vercel.app/docs/getting-started
    }
  }, [holders]);

  //   useEffect(() => {
  //     if (history) {
  //       setLoading(false);
  //       // orders feature
  //       fetch(`/api/orders?key=equipped&nft=${nftId}`)
  //         .then((res) => res.json())
  //         .then((payload) =>
  //           setOrders(
  //             payload
  //               .map((order) => parseFloat(order.pricePerNft * 1e-18))
  //               .sort((a, b) => b - a)
  //               .reverse()
  //           )
  //         );
  //     }
  //   }, [history]);

  const start = () => {
    setLoading(true);
    fetch(`/api/parse?key=equipped&gs=${gsInput}`)
      .then((res) => res.json())
      .then((payload) => setContractToken(payload)); // disables the app
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

  //   if (!history)
  if (!contractToken)
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

  if (contractToken) {
    //   if (history) {
    //     // console.log('maths', 4000000000000000000 * 1e-18)

    //     // console.log('history', history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < txAmountCeiling))

    //     // prevents any tx over 2 from showing
    //     // not sure how to tell what currency was used for tx
    //     // idea is to allow any tx up to 2 eth to show

    //     const labels = Array.from(history).map((label) =>
    //       new Date(label.createdAt).toLocaleString()
    //     );

    //     const up = (ctx, value) => ctx.p0.parsed.y <= ctx.p1.parsed.y ? value : undefined;
    //     const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

    //     const data = {
    //       labels: labels,
    //       datasets: [
    //         {
    //           label: info ? info.name : "NFT Name Not Found",
    //           backgroundColor: "white",
    //           borderColor: "black",
    //           tension: 0.02,
    //           pointRadius: 5,
    //           segment: {
    //             borderWidth: 5,
    //             borderColor: ctx => up(ctx, '#259b24') || down(ctx, '#e51c23'),
    //           },
    //           data: history.map((sale) => {
    //             return {
    //               y: sale.transaction.orderA
    //                 ? (parseFloat(sale.transaction.orderA.amountS) * 1e-18) /
    //                   parseFloat(sale.transaction.orderA.amountB)
    //                 : 0,
    //               x: parseFloat(sale.createdAt),
    //             }
    //           }),
    //           trendlineLinear: {
    //             colorMin: "#259b24",
    //             colorMax: "#e51c23",
    //             lineStyle: "line",
    //             width: 2,
    //             projection: false,
    //           },
    //         },
    //       ],
    //     };

    //     // if (data) console.log(data);
    //     // if (history) console.log(history);
    //     //if (orders) console.log(orders);

    // if (gsInput) console.log('gsInput', gsInput);
    // if (contractToken) console.log('contractToken', contractToken);
    // if (nft) console.log("nft", nft);
    // if (nftData) console.log("nftData", nftData);
    // if (account) console.log("account", account);
    // if (info) console.log('info', info);
    // if (nftId) console.log('nftId', nftId);
    // if (orders) console.log('orders', orders);
    // if (history) console.log('history', history);

    return (
      <div className="container">
        <Head>
          <title>"equipped for multiplayer..."</title>
          <link rel="icon" href="/favicon.png" />
        </Head>
        <main>
          {
            //           <div className="row">
            //             <a href={gsInput} target="_blank">
            //               <img
            //                 src={`https://www.gstop-content.com/ipfs/${
            //                   info ? info.image.match(/(?<=.{7}).+/i) : undefined
            //                 }`}
            //               />
            //             </a>
            //             <div>
            //               <h1 style={{margin: "0"}}>{info ? info.name : "NFT Name Not Found"}</h1>
            //               <p style={{margin: "0"}}>{`${history.length} Sales Found`}</p>
            //               <p style={{ marginTop: 0 }}>{`Listed at ${orders ? orders[0].toFixed(4) : undefined}`}</p>
            //             </div>
            //           </div>
            //           <div >{/* className="row"> */}
            //             {/* <div id="info">
            //               <a href={gsInput} target="_blank">
            //                 <p>{info ? info.name : "NFT Name Not Found"}</p>
            //                 <img
            //                   src={`https://www.gstop-content.com/ipfs/${
            //                     info ? info.image.match(/(?<=.{7}).+/i) : undefined
            //                   }`}
            //                 />
            //               </a>
            //               {orders ? (
            //                 <div>
            //                   <p style={{ marginBottom: 0 }}>{`${orders.length} Listed`}</p>
            //                   <p style={{ marginTop: 0, marginBottom: 0 }}>Lowest Price</p>
            //                   <p style={{ marginTop: 0 }}>{orders[0].toFixed(4)}</p>
            //                 </div>
            //               ) : undefined}
            //               {orders ? (
            //                 <div>
            //                   <p
            //                     style={{ marginBottom: 0 }}
            //                   >{`Prices (10 of ${orders.length})`}</p>
            //                   <ul>
            //                     {orders.slice(0, 10).map((o, i) => (
            //                       <li key={`${i}`}>{`${o.toFixed(4)}`}</li>
            //                     ))}
            //                   </ul>
            //                 </div>
            //               ) : undefined}
            //             </div> */}
            //             <Line
            //               id="chart"
            //               data={data}
            //               plugins={[chartTrendline]}
            //               options={{
            //                 plugins: {
            //                   legend: {
            //                     display: false
            //                   }
            //                 },
            //                 scales: {
            //                   x: {
            //                     ticks: {
            //                       color: "white",
            //                       font: {
            //                         size: 14
            //                       }
            //                     },
            //                     min: data.datasets[0].data[0].x, // data.datasets[0].data[0] ? data.datasets[0].data[0].x : get now in epoch
            //                     type: "time",
            //                     time: { unit: "day" },
            //                   },
            //                   y: {
            //                     ticks: {
            //                       color: "white",
            //                       font: {
            //                         size: 14
            //                       },
            //                       callback: (v, i, t) => `${v} ETH`
            //                     },
            //                     beginAtZero: true
            //                   },
            //                 },
            //               }}
            //             />
            //           </div>
            //           <p>
            //             * DATA INACCURATE, OUTDATED, NOT COMPLETE AND DOES NOT CONSTITUTE
            //             ANY TYPE OF FINANCIAL ADVICE.
            //           </p>
            //           <input
            //             type="text"
            //             onChange={(e) => setGsInput(e.target.value)}
            //           ></input>
            //           <input type="button" value="go" onClick={() => start()}></input>
          }
        </main>

        <style jsx>{``}</style>
        <style jsx global>
          {`
            body {
              background-color: #333;
              padding: 0 10px 10px 10px;
              margin: 0;
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
              align-items: flex-start;
            }
            img {
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

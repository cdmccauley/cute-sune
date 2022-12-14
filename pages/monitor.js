import React, { useState, useEffect } from "react";

import Head from "next/head";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function Montior() {
  const gsInput =
    "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x421c786f85b674befa068dc57866a64483b03d0a49196ce5a3ae3d85c1735c03";

  const { parseData, parseError, parseLoading } = useParse({ gsInput });

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  if (parseError || loopringError || ordersError)
    return <div>failed to load</div>;
  if (parseLoading || loopringLoading || ordersLoading)
    return <div>loading...</div>;

  return (
    <div>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <div className="row">
            <p>{loopringData.metaData.name} {ordersData[0].toFixed(4)}</p>
        </div>
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
    </div>
  );
}

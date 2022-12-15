import React, { useState, useEffect } from "react";

import Head from "next/head";

import MonitorRow from "../components/monitor-row";

export default function Montiors() {
  const yama = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x421c786f85b674befa068dc57866a64483b03d0a49196ce5a3ae3d85c1735c03";
  const katana = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x24ba451b648983a334bc078ae572cfbee2bd38a3aa43eeee74ef041d43496cb8"
  const shinju = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x37e77ddfad9e72edfa85c6e5a82a4a63649aac2c251787dbd5c4d774b325eeff"
  const asumi = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x7b97c2ea98299d0fa17fa534c6d6f617864067f7fb25e787c9e7932ba0707b8d"
  const morikami = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x15aa03031f0d0ee1d314a3603f83b5382e7898ee175a175734925fc01c3d0626"
  const yamamoto = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0xf105ae022c5bcb029f2be4bfeeae637a2cebb2db8b0c867e25114a7a16b42ff3"
  const hisui = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x262278550208f5be6da503208e2bf4a7cac8c788c3ccd3dba9f6f74608ef8d29"
  const odokuru = "https://nft.gamestop.com/token/0xe9c7dea6069c11092d006ef5e2d9f838cea01151/0x95384668728c63c82490fcc8397c2ff30ec456f9a95d59e7db5b5a265a4a1079"
  
  return (
    <div>
      <Head>
        <title>"equipped for multiplayer..."</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <MonitorRow props={yama} />
        <MonitorRow props={katana} />
        <MonitorRow props={shinju} />
        <MonitorRow props={asumi} />
        <MonitorRow props={hisui} />
        <MonitorRow props={odokuru} />
        <MonitorRow props={yamamoto} />
        <MonitorRow props={morikami} />
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
          p {
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
}

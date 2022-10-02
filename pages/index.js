import React, { useState, useEffect } from 'react'

import Head from 'next/head'
import clientPromise from '../lib/mongodb'

import Chart from 'chart.js/auto'
import { Line } from "react-chartjs-2";
import chartTrendline from 'chartjs-plugin-trendline';

export default function Home({ isConnected }) {

  const [gsInput, setGsInput] = useState(undefined);
  const [contractToken, setContractToken] = useState(undefined);
  const [nft, setNft] = useState(undefined);
  const [info, setInfo] = useState(undefined);
  const [history, setHistory] = useState(undefined);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if(contractToken) {
      console.log('contractToken');
      fetch(`/api/loopring?key=equipped&contract=${contractToken.contract}&token=${contractToken.token}`)
      .then((res) => res.json())
      .then((payload) => {
        setNft(payload.loopring);
        setInfo(payload.metaData);
      })
    }
  }, [contractToken])

  useEffect(() => {
    if(nft) {
      fetch(`/api/history?key=equipped&nft=${nft}`)
      .then((res) => res.json())
      .then((payload) => setHistory(payload))
    }
  }, [nft])

  useEffect(() => {
    if (history) {
      console.log(history)
      setLoading(false);
    }
  }, [history])

  const start = () => {
    setLoading(true);
    fetch(`/api/parse?key=equipped&gs=${gsInput}`)
    .then((res) => res.json())
    .then((payload) => setContractToken(payload))
  }

  if (isLoading) return (
    <div>
      <Head>
        <title>cute-sune.vercel.app</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main><p>Loading...</p></main>

      <style jsx>
          {`
            .chart {
              width: 80%;
            }
          `}
        </style>
        <style jsx global>
          {`
            html, body {
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
  )

  if (!history) return (
    <div>
      <Head>
        <title>cute-sune.vercel.app</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <input type="text" onChange={(e) => setGsInput(e.target.value)}></input>
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
            html, body {
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
  )

  if (info) console.log(info);

  if (history) {
    history.reverse()

    console.log('history', history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000))

    const labels = Array.from(history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000).keys()) // don't reverse, doesn't matter
  
    const data = {
      labels: labels,
      datasets: [{
        label: info ? info.name : 'NFT Name Not Found',
        backgroundColor: 'black',
        borderColor: 'white',
        data: history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000).map(sale => sale.transaction.orderA ? (parseFloat(sale.transaction.orderA.amountS) * 1e-18) / parseFloat(sale.transaction.orderA.amountB) : 0),
        trendlineLinear: {
            colorMin: "green",
            colorMax: "red",
            lineStyle: "line",
            width: 2,
            projection: false,
        },
      }],
    };

    return (
      <div className="container">
        <Head>
          <title>cute-sune.vercel.app</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <input type="text" onChange={(e) => setGsInput(e.target.value)}></input>
          <input type="button" value="go" onClick={() => start()}></input>
          <div className="row">
            <div id="info">
              <p>{info ? info.name : 'NFT Name Not Found'}</p>
              <img src={`https://www.gstop-content.com/ipfs/${info ? info.image.match(/(?<=.{7}).+/i) : undefined}`} />
            </div>
            <Line id="chart" data={data} plugins={[chartTrendline]} options={{scales:{y:{beginAtZero:true}}}} />
          </div>
          <p>DATA INNACURATE, OUTDATED AND NOT COMPLETE</p>
        </main>

        <style jsx>
          {``}
        </style>
        <style jsx global>
          {`
            html, body {
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
    )
  }
}

export async function getServerSideProps(context) {
  try {
    await clientPromise
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
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

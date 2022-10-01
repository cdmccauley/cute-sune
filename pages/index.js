import React, { useState, useEffect } from 'react'

import Head from 'next/head'
import clientPromise from '../lib/mongodb'

// import Chart from 'chart.js/auto'
import { Line } from "react-chartjs-2";

export default function Home({ isConnected }) {

  const [gsInput, setGsInput] = useState(undefined);
  const [contractToken, setContractToken] = useState(undefined);
  const [nft, setNft] = useState(undefined);
  const [history, setHistory] = useState(undefined);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if(contractToken) {
      console.log('contractToken');
      fetch(`/api/loopring?key=equipped&contract=${contractToken.contract}&token=${contractToken.token}`)
      .then((res) => res.json())
      .then((payload) => setNft(payload.loopring))
    }
  }, [contractToken])

  useEffect(() => {
    console.log('nft');
    if(nft) {
      fetch(`/api/history?key=equipped&nft=${nft}`)
      .then((res) => res.json())
      .then((payload) => setHistory(payload))
    }
  }, [nft])

  useEffect(() => {
    console.log('history');
    if (history) {
      console.log(history)
      setLoading(false);
    }
  }, [history])

  const start = () => {
    setLoading(true);
    console.log('gsInput')
    fetch(`/api/parse?key=equipped&gs=${gsInput}`)
    .then((res) => res.json())
    .then((payload) => setContractToken(payload))
  }

  if (isLoading) return <p>Loading...</p>

  if (!history) return (
    <div>
        <input type="text" onChange={(e) => setGsInput(e.target.value)}></input>
        <input type="button" value="go" onClick={() => start()}></input>
    </div>
  )

  if (history) {
    // orderA.tokenB = 32810
    history.reverse()
    console.log('history', history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000))

    const labels = Array.from(history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000).keys()) // don't reverse, doesn't matter
  
    // reverse, data is newest first, want olded first?
    const data = {
      labels: labels,
      datasets: [{
        label: 'GSM TX History (Filtered)',
        backgroundColor: 'rgb(0, 0, 0)',
        borderColor: 'rgb(128, 128, 128)',
        data: history.filter((sale) => sale.transaction.orderA && sale.transaction.orderA.amountS < 250000000000000000000).map(sale => sale.transaction.orderA ? (parseFloat(sale.transaction.orderA.amountS) * 1e-18) / parseFloat(sale.transaction.orderA.amountB) : 0),
      }]
    };

    // const config = {
    //   type: 'line',
    //   data: data,
    //   options: {}
    // };

    // const myChart = new Chart(
    //   document.getElementById('myChart'),
    //   config
    // );

    return (
      // history ? history.map(
      // (sale) => (
      //   <div style={{minWidth: "80vw"}}>
      //     <p style={{display: "inline"}}> 
      //       {sale.transaction.orderA ? sale.transaction.orderA.amountB + ' ' + (parseFloat(sale.transaction.orderA.amountS) * 1e-18) : undefined}
      //     </p>{sale.transaction.orderA ? <span style={{display: 'block',maxWidth: (parseFloat(sale.transaction.orderA.amountS) * 1e-18) / parseFloat(sale.transaction.orderA.amountB) * 100 + "vw", backgroundColor: 'green'}}>&nbsp;</span> : undefined }
      //   </div>
      // )) : undefined
      <div>
      <Line data={data} />
      <p>*Innacurate data, do not use</p>
      </div>
    // last 100 tx
    // history ? history.length : undefined
    )
  }

  // pass gs url to parse to get token and contract
  // pass token and contract to loopring to get loopringid
  // pass loopring id to gs to get history

  // return (
  //   <div className="container">
  //     <Head>
  //       <title>Create Next App</title>
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>

  //     <main>
  //       <div>
  //         <input type={"text"}></input>
  //         <input type={"button"} value="go"></input>
  //       </div>
  //       <div>
  //         {
  //           // nftData ? nftData.map(
  //           //   (sale) => (
  //           //     <div style={{minWidth: "80vw"}}>
  //           //     <p style={{display: "inline"}}> 
  //           //       {sale.transaction.orderA ? sale.transaction.orderA.amountB + ' ' + parseFloat('0.' + sale.transaction.orderA.amountS) : undefined}
  //           //     </p>{sale.transaction.orderA ? <span style={{display: 'block',maxWidth: parseFloat('0.' + sale.transaction.orderA.amountS) * 100 + "vw", backgroundColor: 'green'}}>&nbsp;</span> : undefined }
  //           //     </div>
  //           //   )
                
  //           // ) : undefined
  //           // // last 100 tx
  //           // // nftData ? nftData.length : undefined
  //         }
  //       </div>
  //     </main>

  //     <style jsx>{`
  //       .container {
  //         min-height: 100vh;
  //         padding: 0 0.5rem;
  //         display: flex;
  //         flex-direction: column;
  //         justify-content: center;
  //         align-items: center;
  //       }

  //       main {
  //         padding: 5rem 0;
  //         flex: 1;
  //         display: flex;
  //         flex-direction: column;
  //         justify-content: center;
  //         align-items: center;
  //       }

  //       footer {
  //         width: 100%;
  //         height: 100px;
  //         border-top: 1px solid #eaeaea;
  //         display: flex;
  //         justify-content: center;
  //         align-items: center;
  //       }

  //       footer img {
  //         margin-left: 0.5rem;
  //       }

  //       footer a {
  //         display: flex;
  //         justify-content: center;
  //         align-items: center;
  //       }

  //       a {
  //         color: inherit;
  //         text-decoration: none;
  //       }

  //       .title a {
  //         color: #0070f3;
  //         text-decoration: none;
  //       }

  //       .title a:hover,
  //       .title a:focus,
  //       .title a:active {
  //         text-decoration: underline;
  //       }

  //       .title {
  //         margin: 0;
  //         line-height: 1.15;
  //         font-size: 4rem;
  //       }

  //       .title,
  //       .description {
  //         text-align: center;
  //       }

  //       .subtitle {
  //         font-size: 2rem;
  //       }

  //       .description {
  //         line-height: 1.5;
  //         font-size: 1.5rem;
  //       }

  //       code {
  //         background: #fafafa;
  //         border-radius: 5px;
  //         padding: 0.75rem;
  //         font-size: 1.1rem;
  //         font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
  //           DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
  //       }

  //       .grid {
  //         display: flex;
  //         align-items: center;
  //         justify-content: center;
  //         flex-wrap: wrap;

  //         max-width: 800px;
  //         margin-top: 3rem;
  //       }

  //       .card {
  //         margin: 1rem;
  //         flex-basis: 45%;
  //         padding: 1.5rem;
  //         text-align: left;
  //         color: inherit;
  //         text-decoration: none;
  //         border: 1px solid #eaeaea;
  //         border-radius: 10px;
  //         transition: color 0.15s ease, border-color 0.15s ease;
  //       }

  //       .card:hover,
  //       .card:focus,
  //       .card:active {
  //         color: #0070f3;
  //         border-color: #0070f3;
  //       }

  //       .card h3 {
  //         margin: 0 0 1rem 0;
  //         font-size: 1.5rem;
  //       }

  //       .card p {
  //         margin: 0;
  //         font-size: 1.25rem;
  //         line-height: 1.5;
  //       }

  //       .logo {
  //         height: 1em;
  //       }

  //       @media (max-width: 600px) {
  //         .grid {
  //           width: 100%;
  //           flex-direction: column;
  //         }
  //       }
  //     `}</style>

  //     <style jsx global>{`
  //       html,
  //       body {
  //         padding: 0;
  //         margin: 0;
  //         font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
  //           Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
  //           sans-serif;
  //       }

  //       * {
  //         box-sizing: border-box;
  //       }
  //     `}</style>
  //   </div>
  // )
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

import React, { useEffect, useState, useRef } from "react";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function Monitor({ props }) {
  const { parseData, parseError, parseLoading } = useParse(props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  useEffect(() => {
    localStorage.setItem(props.url, JSON.stringify([]));
  }, []);

  useEffect(() => {
    const prevOrdersData = JSON.parse(localStorage.getItem(props.url));
    
    // // sold out or delisted, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length > 0 && ordersData.length == 0)
      localStorage.setItem(props.url, JSON.stringify([Number.MAX_VALUE]));

    // not listed, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData.length == 0)
      localStorage.setItem(props.url, JSON.stringify([Number.MAX_VALUE]));

    // listings have arrived, set current lowest so next lowest will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData[0])
      localStorage.setItem(props.url, JSON.stringify(ordersData));

    // lower listing has arrived, notify
    if (prevOrdersData && ordersData[0] < prevOrdersData[0]) {
      console.info(
        prevOrdersData[0],
        loopringData.metaData.name,
        ordersData[0]
      );
      props.setSoundOff(true);

      new Notification(`${loopringData.metaData.name} Price Alert`, {
        body: `${ordersData[0].toFixed(4)} Lowest Found`,
        icon: `https://www.gstop-content.com/ipfs/${
          loopringData
            ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
            : undefined
        }`,
      });
      localStorage.setItem(props.url, JSON.stringify(ordersData));
    } else if (!ordersData.length == 0) {
      localStorage.setItem(props.url, JSON.stringify(ordersData));
    }
  }, [ordersData]);

  if (parseError || loopringError || ordersError)
    return <div>Failed to load</div>;
  if (parseLoading || loopringLoading || ordersLoading)
    return <div>Loading...</div>;

  return (
    <div className="row">
      <a href={props.url} target="_blank">
        <img
          src={`https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
              : undefined
          }`}
        />
      </a>
      <div className="info">
        <h3>{`${loopringData.metaData.name}`}</h3>
        <p>{`${ordersData ? ordersData.length : 0} Prices Found`}</p>
        <p hidden={!ordersData.length > 0}>{`${
          ordersData.length > 0 ? ordersData[0].toFixed(4) : undefined
        } Lowest Found`}</p>
      </div>
      <div className={"remove"}>
        <button
          onClick={() => {
            props.setGSURLs(props.gsURLs.filter((v, i) => i != props.index));
            localStorage.setItem(
              "gsURLs",
              JSON.stringify(props.gsURLs.filter((v, i) => i != props.index))
            );
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

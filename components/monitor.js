import React, { useEffect, useRef } from "react";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function Monitor({ props }) {
  const prevOrdersData = useRef([undefined]);

  const { parseData, parseError, parseLoading } = useParse(props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  useEffect(() => {
    // // sold out or delisted, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length > 0 && ordersData.length == 0)
      prevOrdersData.current = [Number.MAX_VALUE];

    // not listed, set max lowest so next listing will alert
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData.length == 0)
      prevOrdersData.current = [Number.MAX_VALUE];

    // lower listing has arrived, notify
    if (prevOrdersData && ordersData[0] < prevOrdersData.current[0]) {
      console.info(loopringData.metaData.name, ordersData[0]);
      props.setSoundOff(true);

      new Notification(`${loopringData.metaData.name} Price Alert`, {
        body: `${ordersData[0].toFixed(4)} Lowest Found`,
        icon: `https://www.gstop-content.com/ipfs/${
          loopringData
            ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
            : undefined
        }`,
      });
    }

    // listings have arrived, set current lowest so next lowest will alert
    if (prevOrdersData && prevOrdersData[0] == undefined && ordersData[0])
      prevOrdersData.current = [ordersData[0]];
  }, [ordersData]);

  useEffect(() => {
    return () => (prevOrdersData.current = [undefined]);
  }, []);

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

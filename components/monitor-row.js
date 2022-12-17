import React, { useEffect, useState, useRef } from "react";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

const usePreviousValue = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default function MonitorRow(props) {
  const [lowestOrder, setLowestOrder] = useState(Number.MAX_VALUE);
  const [isListed, setIsListed] = useState(false);

  const prevLowestOrder = usePreviousValue(lowestOrder);

  const { parseData, parseError, parseLoading } = useParse(props.props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  useEffect(() => {
    if (
      prevLowestOrder &&
      prevLowestOrder != Number.MAX_VALUE &&
      lowestOrder < prevLowestOrder
    ) {
      console.info(loopringData.metaData.name, lowestOrder);
      props.props.setSoundOff(true);
    }
  }, [lowestOrder]);

  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      setLowestOrder(ordersData[0]);
      setIsListed(!Number.isNaN(ordersData[0]));
    }
  }, [ordersData]);

  if (parseError || loopringError || ordersError)
    return <div>failed to load</div>;
  if (parseLoading || loopringLoading || ordersLoading)
    return <div>loading...</div>;

  return (
    <div className="row">
      <a href={props.props.url} target="_blank">
        <img
          src={`https://www.gstop-content.com/ipfs/${
            loopringData
              ? loopringData.metaData.image.match(/(?<=.{7}).+/i)
              : undefined
          }`}
        />
      </a>
      <div>
        <h3>{`${loopringData.metaData.name}`}</h3>
        <p>{`${isListed ? ordersData.length : 0} Prices Found`}</p>
        <p hidden={!isListed}>{`${ordersData[0].toFixed(4)} Lowest Found`}</p>
      </div>
      <div className={"remove"}>
        <button
          onClick={() =>
            props.props.setGSURLs(
              props.props.gsURLs.filter((v, i) => i != props.props.index)
            )
          }
        >
          Remove
        </button>
      </div>
    </div>
  );
}

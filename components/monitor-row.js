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
    const [lowest, setLowest] = useState()
  const { parseData, parseError, parseLoading } = useParse(props.props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  const prevOrdersData = usePreviousValue(ordersData)

  useEffect(() => {
    // console.log(prevOrdersData, ordersData)

    if (prevOrdersData && prevOrdersData.length > 0 && ordersData.length == 0) setLowest(Number.MAX_VALUE)
    if (prevOrdersData && prevOrdersData.length == 0 && ordersData.length == 0) setLowest(Number.MAX_VALUE)

    if (prevOrdersData && prevOrdersData[0] == undefined && ordersData[0]) setLowest(ordersData[0])

    if (prevOrdersData && ordersData[0] < lowest) {
        setLowest(ordersData[0])
        console.info('soundOff', loopringData.metaData.name, ordersData[0])
        props.props.setSoundOff(true)
    }
    
  }, [ordersData]);

//   useEffect(() => console.log('lowest', lowest), [lowest])

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
        <p>{`${ordersData ? ordersData.length : 0} Prices Found`}</p>
        <p hidden={!ordersData.length > 0}>{`${ordersData.length > 0 ? ordersData[0].toFixed(4) : undefined} Lowest Found`}</p>
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

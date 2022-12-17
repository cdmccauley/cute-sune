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
  // console.log(props)
  const [lowestOrder, setLowestOrder] = useState(Number.MAX_VALUE);

  const prevLowestOrder = usePreviousValue(lowestOrder);

  const { parseData, parseError, parseLoading } = useParse(props.props);

  const { loopringData, loopringError, loopringLoading } = useLoopring(
    parseData ? { parseData } : null
  );

  const { ordersData, ordersError, ordersLoading } = useOrders(
    loopringData ? { loopringData } : null
  );

  useEffect(() => {
    console.log("lowest order change, prevLowestOrder", prevLowestOrder);
    // tested and works, if a call to the props state changer breaks it, it's not the condition
    if (prevLowestOrder && prevLowestOrder != Number.MAX_VALUE && lowestOrder < prevLowestOrder) console.log("settingSoundOff")
  }, [lowestOrder]);

  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
        console.log('50', ordersData)
        setLowestOrder(ordersData[0]);
    }
  }, [ordersData])

  if (parseError || loopringError || ordersError)
    return <div>failed to load</div>;
  if (parseLoading || loopringLoading || ordersLoading)
    return <div>loading...</div>;

  return (
    <div className="row">
      <p>
        {`${ordersData[0].toFixed(4)} ${ordersData.length} ${
          loopringData.metaData.name
        }`}
      </p>
    </div>
  );
}

import React from "react";

import useParse from "../data/use-parse";
import useLoopring from "../data/use-loopring";
import useOrders from "../data/use-orders";

export default function MonitorRow(props) {
  const { parseData, parseError, parseLoading } = useParse(props);

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
    <div className="row">
      <p>
        {`${ordersData[0].toFixed(4)} ${ordersData.length} ${loopringData.metaData.name}`}
      </p>
    </div>
  );
}

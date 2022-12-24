import useSWR from "swr";

export default function useOrders(props) {
  const nftId =
    props && props.loopringData ? props.loopringData.nftId : undefined;
  const userInterval =
    props && props.userInterval ? props.userInterval : 60000 * 5; // 5m
  const url = `/api/orders?key=equipped&nft=${nftId}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(nftId ? url : null, fetcher, {
    refreshInterval: userInterval,
    refreshWhenHidden: true,
    revalidateOnFocus: false,
  });

  const ordersLoading = !data && !error;
  const ordersError = error;

  // need to filter out fulfilled orders, look at stuff that still has og mints

  const ordersData =
    data && Array.isArray(data) && data.length > 0
      ? data
          .map((order) => {
            if (Number.parseInt(order.amount) > 1)
              return Array.from({ length: Number.parseInt(order.amount) }, () =>
                parseFloat(order.pricePerNft * 1e-18)
              );
            return parseFloat(order.pricePerNft * 1e-18);
          })
          .reduce((a, b) => a.concat(b), [])
          .sort((a, b) => a - b)
      : data && Array.isArray(data)
      ? []
      : [undefined];

  return {
    ordersLoading,
    ordersError,
    ordersData,
  };
}

import useSWR from "swr";

export default function useOrders(props) {
  const nftId = props ? props.loopringData.nftId : undefined;
  const url = `/api/orders?key=equipped&nft=${nftId}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(nftId ? url : null, fetcher, {
    refreshInterval: 60000 * 5, //5 * 1000,
    refreshWhenHidden: true,
    revalidateOnFocus: false
  });

  const ordersLoading = !data && !error;
  const ordersError = error;

  const ordersData =
    data && Array.isArray(data) && data.length > 0
      ? data
          .map((order) => parseFloat(order.pricePerNft * 1e-18))
          .sort((a, b) => b - a)
          .reverse()
      : data && Array.isArray(data) ? [] : [undefined];

  return {
    ordersLoading,
    ordersError,
    ordersData,
  };
}

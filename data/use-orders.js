import useSWR from "swr";

export default function useOrders(props) {
  const nftId = props ? props.loopringData.nftId : undefined;
  const url = `/api/orders?key=equipped&nft=${nftId}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, isLoading } = useSWR(nftId ? url : null, fetcher, {
    refreshInterval: 20000,
    refreshWhenHidden: true,
  });

  const ordersLoading = !data && !error;
  const ordersError = error;

  let ordersData =
    data && Array.isArray(data)
      ? data
          .map((order) => parseFloat(order.pricePerNft * 1e-18))
          .sort((a, b) => b - a)
          .reverse()
      : [];

  return {
    ordersLoading,
    ordersError,
    ordersData,
  };
}

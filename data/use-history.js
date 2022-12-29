import useSWRInfinite from "swr/infinite";

export default function useHistory(props) {
  const nft = props ? props.nft : [];

  const getKey = (pageIndex, previousPageData) => {
    if (pageIndex < nft.length)
      return `/api/history?key=equipped&nft=${nft[pageIndex]}`;
    return null;
  };

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, size, setSize } = useSWRInfinite(
    nft ? getKey : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000 * 5,
    }
  );

  if (data && nft.length > 1 && size < nft.length) setSize(size + 1);

  const historyLoading = !data && !error;
  const historyError = error;
  const historyData = data ? data.flat(1) : data;

  return {
    historyLoading,
    historyError,
    historyData,
  };
}

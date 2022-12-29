import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function useHistory(props) {
  const nft = props ? props.nft : []; // changes to array of string

  // now we have multiple keys to fetch
  // reference... use-holders

  const getKey = (pageIndex, previousPageData) => {
    console.log(
      "pageIndex",
      pageIndex,
      "previousPageData",
      previousPageData,
      "nft.length",
      nft.length,
      "nft[pageIndex]",
      nft[pageIndex]
    );

    if (pageIndex < nft.length)
      return `/api/history?key=equipped&nft=${nft[pageIndex]}`;
    return null;
  };

  ////
  // const url = `/api/history?key=equipped&nft=${nft}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, size, setSize } = useSWRInfinite(
    nft ? getKey : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  if (data && nft.length > 0) console.log(nft.length);
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

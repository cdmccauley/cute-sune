import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

export default function useHolders(props) {
  const limit = 180;
  const nftData = props ? props.loopringData.loopring : "";

  const getKey = (pageIndex, previousPageData) => {
    if (pageIndex === 0)
      return `/api/holders?key=equipped&nftData=${nftData}&offset=0`;

    if (pageIndex <= Math.ceil(previousPageData.holders.totalNum / limit))
      return `/api/holders?key=equipped&nftData=${nftData}&offset=${
        pageIndex * limit
      }`;

    return null;
  };

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, size, setSize } = useSWRInfinite(
    nftData ? getKey : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const holdersLoading = !data && !error;
  const holdersError = error;
  const holdersData = data && data.holders ? data.holders : data;

  if (data && size != Math.ceil(data[0].holders.totalNum / limit)) {
    setSize(Math.ceil(data[0].holders.totalNum / limit));
  }

  return {
    holdersLoading,
    holdersError,
    holdersData,
  };
}

// to parse for total mints (that were never transferred offchain?)
//   if (props && data)
//     console.log(
//       props.loopringData.metadataJson.name,
//       data
//         .map((o) => o.holders.nftHolders.map((o) => Number.parseInt(o.amount)))
//         .map((a) => a.reduce((total, curr) => total + curr))
//         .reduce((total, curr) => total + curr)
//     );

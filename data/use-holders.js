import useSWR from "swr";

export default function useHolders(props) {
  const nftData = props ? props.loopringData.loopring    : "";
  const offset = "0";

  const url = `/api/holders?key=equipped&nftData=${nftData}&offset=${offset}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(nftData ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  const holdersLoading = !data && !error;
  const holdersError = error;
  const holdersData = data && data.holders ? data.holders : data;

//   console.log(data)

  return {
    holdersLoading,
    holdersError,
    holdersData,
  };
}

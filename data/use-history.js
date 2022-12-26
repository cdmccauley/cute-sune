import useSWR from "swr";

export default function useHistory(props) {
  const nft = props ? props.nft : "";

  const url = `/api/history?key=equipped&nft=${nft}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(nft ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  const historyLoading = !data && !error;
  const historyError = error;
  const historyData = data;

  // console.log(data)

  return {
    historyLoading,
    historyError,
    historyData,
  };
}

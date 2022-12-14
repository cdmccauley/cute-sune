import useSWR from "swr";

export default function useLoopring(props) {
  const contract = props ? props.parseData.contract : ''
  const token = props ? props.parseData.token : ''

  const url = `/api/loopring?key=equipped&contract=${contract}&token=${token}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, isLoading } = useSWR(contract && token ? url : null, fetcher);

  const loopringLoading = !data && !error;
  const loopringError = error;
  const loopringData = data;

  return {
    loopringLoading,
    loopringError,
    loopringData,
  };
}

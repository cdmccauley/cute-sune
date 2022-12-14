import useSWR from "swr";

export default function useParse(props) {
  const url = `/api/parse?key=equipped&gs=${props.gsInput}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, isLoading } = useSWR(url, fetcher);

  const parseLoading = !data && !error;
  const parseError = error;
  const parseData = data;

  return {
    parseLoading,
    parseError,
    parseData,
  };
}

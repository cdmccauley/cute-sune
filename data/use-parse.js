import useSWR from "swr";

export default function useParse(props) {
  const gsInput = props.props;
  const url = `/api/parse?key=equipped&gs=${gsInput}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error, isLoading } = useSWR(gsInput ? url : null, fetcher);

  const parseLoading = !data && !error;
  const parseError = error;
  const parseData = data;

  return {
    parseLoading,
    parseError,
    parseData,
  };
}

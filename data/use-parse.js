import useSWR from "swr";

export default function useParse(props) {
  // console.log(props);
  const gsInput = props.url;
  const url = `/api/parse?key=equipped&gs=${gsInput}`;

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, error } = useSWR(gsInput ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  const parseLoading = !data && !error;
  const parseError = error;
  const parseData = data;

  return {
    parseLoading,
    parseError,
    parseData,
  };
}

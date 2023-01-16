import useSWRInfinite from "swr/infinite";

export default function useHistory(props) {
  const nft = props ? props.nft : [];

  const keyPair = props ? props.keyPair : null;
  const session = props ? props.session : null;
  const signature = props ? props.signature : null;

  const getKey = (pageIndex, previousPageData) => {
    if (pageIndex < nft.length) return `/api/history?nftData=${nft[pageIndex]}`;
    return null;
  };

  const fetcher = async (url) => {
    const d = await window.crypto.subtle
      .decrypt({ name: "RSA-OAEP" }, keyPair.privateKey, session.apiKey)
      .then((dres) => dres);

    const e = await window.crypto.subtle
      .encrypt(
        { name: "RSA-OAEP" },
        session.server,
        new TextEncoder().encode(
          `${Buffer.from(d).toString()},${new Date().valueOf()}`
        )
      )
      .then((eres) => eres);

    return await fetch(url, {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        Authorization: JSON.stringify({
          key: Buffer.from(e).toString("base64"),
          wallet: signature.provider,
        }),
      },
    }).then((res) => res.json());
  };

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

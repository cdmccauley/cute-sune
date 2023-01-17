import useSWR from "swr";

export default function useLoopring(props) {
  const contract = props ? props.parseData.contract : "";
  const token = props ? props.parseData.token : "";
  const keyPair = props ? props.keyPair : null;
  const session = props ? props.session : null;
  const signature = props ? props.signature : null;

  const url = `/api/loopring?contract=${contract}&token=${token}`;

  const fetcher = (url) =>
    window.crypto.subtle
      .decrypt({ name: "RSA-OAEP" }, keyPair.privateKey, session.apiKey)
      .then((dres) => {
        return window.crypto.subtle
          .encrypt(
            { name: "RSA-OAEP" },
            session.server,
            new TextEncoder().encode(
              `${Buffer.from(dres).toString()},${new Date().valueOf()}`
            )
          )
          .then((eres) =>
            fetch(url, {
              method: "GET",
              withCredentials: true,
              credentials: "include",
              headers: {
                Authorization: JSON.stringify({
                  key: Buffer.from(eres).toString("base64"),
                  wallet: signature.provider,
                }),
                "Content-Type": "application/json",
              },
            }).then((r) => r.json())
          );
      });

  const { data, error } = useSWR(contract && token ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  const loopringLoading = !data && !error;
  const loopringError = error;
  const loopringData = data;

  return {
    loopringLoading,
    loopringError,
    loopringData,
  };
}

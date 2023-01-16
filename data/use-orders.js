import useSWR from "swr";

export default function useOrders(props) {
  const nftId =
    props && props.loopringData ? props.loopringData.nftId : undefined;
  const userInterval =
    props && props.userInterval ? props.userInterval : 60000 * 5; // 5m

  const keyPair = props ? props.keyPair : null;
  const session = props ? props.session : null;
  const signature = props ? props.signature : null;

  const url = `/api/orders`;

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
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nftId: nftId,
                key: Buffer.from(eres).toString("base64"),
                wallet: signature.provider,
              }),
            }).then((r) => r.json())
          );
      });

  const { data, error } = useSWR(nftId ? url : null, fetcher, {
    refreshInterval: userInterval,
    refreshWhenHidden: true,
    revalidateOnFocus: false,
  });

  const ordersLoading = !data && !error;
  const ordersError = error;

  const ordersData =
    data && Array.isArray(data) && data.length > 0
      ? data
          .map((order) => {
            if (Number.parseInt(order.amount) > 1) {
              return Array.from(
                {
                  length:
                    Number.parseInt(order.amount) -
                    Number.parseInt(order.fulfilledAmount),
                },
                () => parseFloat(order.pricePerNft * 1e-18)
              );
            }
            return parseFloat(order.pricePerNft * 1e-18);
          })
          .reduce((a, b) => a.concat(b), [])
          .sort((a, b) => a - b)
      : data && Array.isArray(data)
      ? []
      : [undefined];

  return {
    ordersLoading,
    ordersError,
    ordersData,
  };
}

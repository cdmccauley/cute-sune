import useSWR from "swr";

export default function useOrders(props) {
  const nftId =
    props && props.loopringData ? props.loopringData.nftId : undefined;
  const userInterval =
    props && props.userInterval ? props.userInterval : 60000 * 5; // 5m

  const keyPair = props ? props.keyPair : null;
  const session = props ? props.session : null;
  const signature = props ? props.signature : null;

  const url = `/api/orders?nftId=${nftId}`;

  const fetcher = async (url) => {
    const dres = await window.crypto.subtle
      .decrypt({ name: "RSA-OAEP" }, keyPair.privateKey, session.apiKey)
      .catch((e) => {
        console.error("decrypt error", e);
        return undefined;
      });

    const eres = dres
      ? await window.crypto.subtle
          .encrypt(
            { name: "RSA-OAEP" },
            session.server,
            new TextEncoder().encode(
              `${Buffer.from(dres).toString()},${new Date().valueOf()}`
            )
          )
          .catch((e) => {
            console.error("encrypt error", e);
            return undefined;
          })
      : undefined;

    const rres = eres
      ? await fetch(url, {
          method: "GET",
          withCredentials: true,
          credentials: "include",
          headers: {
            Authorization: JSON.stringify({
              key: Buffer.from(eres).toString("base64"),
              wallet: signature.provider,
            }),
          },
        }).catch((e) => {
          console.error("fetch error", e);
          return undefined;
        })
      : undefined;

    const jsonify = rres
      ? await rres.json().catch((e) => {
          console.error("json error", e);
          return undefined;
        })
      : undefined;

    if (!jsonify) {
      return [];
    } else if (
      jsonify &&
      Array.isArray(jsonify) &&
      jsonify.length > 0 &&
      !jsonify[0]
    ) {
      return [];
    } else {
      return jsonify;
    }
  };

  const { data, error } = useSWR(nftId ? url : null, fetcher, {
    refreshInterval: userInterval,
    refreshWhenHidden: true,
    revalidateOnFocus: false,
  });

  const ordersLoading = !data && !error;
  const ordersError = error;

  const ordersData =
    data && Array.isArray(data) && data.length > 0 && data[0]
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
      : data && Array.isArray(data) && !data[0]
      ? []
      : [undefined];

  return {
    ordersLoading,
    ordersError,
    ordersData,
  };
}

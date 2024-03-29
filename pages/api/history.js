import clientPromise from "../../lib/mongodb";

import crypto from "crypto";

export default async function handler(req, res) {
  let result = { undefined };

  try {
    const argCheck =
      req.query && req.query.nftData && req.headers.authorization;

    if (argCheck) {
      const auth = {
        key: JSON.parse(req.headers.authorization).key,
        wallet: JSON.parse(req.headers.authorization).wallet,
      };

      // prepare
      const client = await clientPromise;
      const database = client.db("verification");
      const sessions = database.collection("sessions");
      const blacklist = database.collection("blacklist");

      // maintain
      const expired = new Date().valueOf() - 8.64e7;
      await sessions.deleteMany({ created: { $lt: expired } });

      // check blacklist
      const blacklisted = await blacklist.findOne({
        _id: auth.wallet,
        enabled: true,
      });

      if (blacklisted) console.error("blacklisted", blacklisted);

      // check session exists
      const existing = await sessions.findOne({
        _id: auth.wallet,
      });

      if (existing && !blacklisted) {
        // build the private key
        const privateKey = await crypto.webcrypto.subtle.importKey(
          "jwk",
          JSON.parse(existing.server.privateKey),
          { name: "RSA-OAEP", hash: "SHA-256" },
          true,
          ["decrypt"]
        );

        // decrypt the api key
        const apiKey = await crypto.webcrypto.subtle
          .decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            Uint8Array.from(atob(auth.key), (c) => c.charCodeAt(0))
          )
          .then((res) => Buffer.from(res).toString().split(","));

        if (apiKey[0] == existing.apiKey) {
          let url = `https://api.nft.gamestop.com/nft-svc-marketplace/history?nftData=${req.query.nftData}`;

          await fetch(url, {
            credentials: "omit",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
              Accept: "*/*",
              "Accept-Language": "en-US,en;q=0.5",
              "Sec-Fetch-Dest": "empty",
              "Sec-Fetch-Mode": "cors",
              "Sec-Fetch-Site": "same-site",
              "If-None-Match": "0.40497919487697753",
            },
            referrer: "https://nft.gamestop.com/",
            method: "GET",
            mode: "cors",
          })
            .then((response) => response.json())
            .then((payload) => {
              result = payload;
            });
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    res.status(200).json(result);
  }
}

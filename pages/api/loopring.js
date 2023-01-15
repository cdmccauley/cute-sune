import clientPromise from "../../lib/mongodb";

import crypto from "crypto";

export default async function handler(req, res) {
  let result = {
    loopring: undefined,
  };

  const argCheck =
    req.body &&
    req.body.contract &&
    req.body.key &&
    req.body.token &&
    req.body.wallet;

  if (req.method == "POST" && argCheck) {
    try {
      //// prepare
      const client = await clientPromise;
      const database = client.db("verification");
      const sessions = database.collection("sessions");
      const blacklist = database.collection("blacklist");

      //// maintain
      const expired = new Date().valueOf() - 8.64e7;
      await sessions.deleteMany({ created: { $lt: expired } });

      //// check blacklist
      const blacklisted = await blacklist.findOne({
        _id: req.body.wallet,
        enabled: true,
      });

      if (blacklisted) console.log("blacklisted", blacklisted);

      //// check session exists
      const existing = await sessions.findOne({
        _id: req.body.wallet,
      });

      if (existing) {
        const privateKey = await crypto.webcrypto.subtle.importKey(
          "jwk",
          JSON.parse(existing.server.privateKey),
          { name: "RSA-OAEP", hash: "SHA-256" },
          true,
          ["decrypt"]
        );

        await crypto.webcrypto.subtle
          .decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            Uint8Array.from(atob(req.body.key), (c) => c.charCodeAt(0))
          )
          .then((res) => {
            console.log("client", req.body.key);
            console.log("decrypt", Buffer.from(res).toString());
            console.log("apiKey", existing.apiKey);
          });
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (req.body.contract && req.body.token) {
        let url = `https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=${req.body.token}_${req.body.contract}`;
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

    res.status(200).json(result);
  }
}

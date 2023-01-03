import clientPromise from "../../lib/mongodb";

import { verifyMessage } from "ethers/lib/utils.js";

import crypto from "crypto";
import util from "util";

const generateKeyPair = util.promisify(crypto.generateKeyPair);

export default async function handler(req, res) {
  // called when client recieves a signature
  // introduction returns message to client
  // once client connects their wallet they're prompted to sign message
  // client creates signature with their connected wallet
  // wallet is address returned to client after they connect their wallet
  const argCheck =
    req.body.uuid &&
    req.body.message &&
    req.body.wallet &&
    req.body.signature &&
    req.body.publicKey;

  // console.log(JSON.parse(req.body.publicKey));

  if (req.method == "POST" && argCheck) {
    let result = {
      session: undefined,
    };

    try {
      //// prepare
      const client = await clientPromise;
      const database = client.db("verification");
      const messages = database.collection("messages");
      const sessions = database.collection("sessions");
      const blacklist = database.collection("blacklist");

      //// maintain
      const expired = new Date().valueOf() - 8.64e7;
      await messages.deleteMany({ created: { $lt: expired } });
      await sessions.deleteMany({ created: { $lt: expired } });

      //// check blacklist
      const blacklisted = await blacklist.findOne({
        _id: req.body.wallet,
        enabled: true,
      });

      if (blacklisted) console.log("blacklisted", blacklisted);

      //// check message exists
      const existing = await messages.findOne({
        _id: req.body.uuid,
        message: req.body.message,
      });

      if (!blacklisted && existing) {
        //// check wallet is hodler
        const host =
          process.env.VERCEL_ENV == "production"
            ? "https://cute-sune.vercel.app"
            : "http://localhost:3000";

        // await so res is not sent before it has data from inner fetches
        await fetch(`${host}/api/account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: process.env.CUTE_SUNE_API_KEY,
            wallet: req.body.wallet,
          }),
        })
          .then((accountResponse) => accountResponse.json())
          .then((accountJson) => {
            // check res for nftdata
            const nftDatas = [
              "0x215c32952e02dc4026b712c8848c6d52bf5b6361fe7204f7055400bbfb37ea31",
            ].toString();
            const host =
              process.env.VERCEL_ENV == "production"
                ? "https://cute-sune.vercel.app"
                : "http://localhost:3000";
            return fetch(`${host}/api/balances`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: process.env.CUTE_SUNE_API_KEY,
                accountId: accountJson.account.accountId,
                nftDatas: nftDatas,
              }),
            })
              .then((balancesResponse) => balancesResponse.json())
              .then((balancesJson) => balancesJson);
          })
          .then(async (balancesResponse) => {
            //// check signature is message signed by wallet
            if (
              balancesResponse.balances.totalNum > 0 &&
              verifyMessage(req.body.message, req.body.signature) ==
                req.body.wallet
            ) {
              const me = await generateKeyPair("rsa", {
                modulusLength: 4096,
                hashAlgorithm: "SHA-256",
              }).then((res) => res);

              // create or overwrite key
              await sessions.updateOne(
                { _id: req.body.wallet },
                {
                  $set: {
                    apiKey: crypto.randomUUID(),
                    client: crypto.webcrypto.subtle.importKey(
                      "jwk",
                      JSON.parse(req.body.publicKey),
                      { name: "RSA-OAEP", hash: "SHA-256" },
                      true,
                      ["encrypt"]
                    ),
                    server: {
                      publicKey: me.publicKey.export({ format: "jwk" }),
                      privateKey: me.privateKey.export({ format: "jwk" }),
                    },
                    created: new Date().valueOf(),
                  },
                },
                { upsert: true }
              );

              // get same key from db to give to client
              const confirm = await sessions.findOne({
                _id: req.body.wallet,
              });

              console.log(confirm.client);

              result = {
                server: confirm.server.publicKey,
                apiKey: null, // trying to encrypt the key here to send
              };
            }
          });
      }
    } catch (e) {
      console.log(e);
    } finally {
      res.status(200).json(result);
    }
  }
}

// Asumi    0x265e9dcc6215b4943f5471a29718aaefdd5b3148c579533410e7357fd044b33e
// Yamamoto    0x23d96e8df4e62ffc49439f416b0684e3fd5b9d7cccddf73aadd107b44f5eaffa
// Morikami    0x2bfb305e41512bceac0f71efba3e2e4a553a341afa5f7be5502b31c62e90fdfa
// Shinju    0x1e172026705448a342c7cc5e8e00b474e6f1621cfb09a11621e1ad5398176cd8
// Odokuro    0x156eae9c915b5300a12a7b4c13f88ff7e7ea08b2f4a689ec129ab60bcc01e975
// Hisui    0x0a8dff58caef384db04e85eed9eb7dbb03df6f6df80caac84ae8c6604498b8c9
// Katana    0x215c32952e02dc4026b712c8848c6d52bf5b6361fe7204f7055400bbfb37ea31

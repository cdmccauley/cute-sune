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

        const accountJson = await fetch(`${host}/api/account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: process.env.CUTE_SUNE_API_KEY,
            wallet: req.body.wallet,
          }),
        }).then((accountResponse) => accountResponse.json());

        // check res for nftdata
        const nftDatas = [
          "0x215c32952e02dc4026b712c8848c6d52bf5b6361fe7204f7055400bbfb37ea31",
        ].toString();

        const balancesJson = await fetch(`${host}/api/balances`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: process.env.CUTE_SUNE_API_KEY,
            accountId: accountJson.account.accountId,
            nftDatas: nftDatas,
          }),
        }).then((balancesResponse) => balancesResponse.json());

        //// check signature is message signed by wallet
        if (
          balancesJson.balances.totalNum > 0 &&
          verifyMessage(req.body.message, req.body.signature) == req.body.wallet
        ) {
          const me = await generateKeyPair("rsa", {
            modulusLength: 4096,
            hashAlgorithm: "SHA-256",
          }).then((res) => res);

          // create or overwrite session
          await sessions.updateOne(
            { _id: req.body.wallet },
            {
              $set: {
                apiKey: crypto.randomUUID(),
                client: req.body.publicKey,
                server: {
                  publicKey: JSON.stringify(
                    me.publicKey.export({ format: "jwk" })
                  ),
                  privateKey: JSON.stringify(
                    me.privateKey.export({ format: "jwk" })
                  ),
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

          // encrypt for client ops outside memory
          const confirmClient = await crypto.webcrypto.subtle.importKey(
            "jwk",
            JSON.parse(confirm.client),
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
          );

          const encryptedKey = await crypto.webcrypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            confirmClient,
            confirm.apiKey
          );

          result = {
            server: confirm.server.publicKey,
            apiKey: Buffer.from(encryptedKey).toString("base64"),
          };
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      res.status(200).json(result);
    }
  }
}

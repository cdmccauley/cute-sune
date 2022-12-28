import clientPromise from "../../lib/mongodb";

import crypto from "crypto";

export default async function handler(req, res) {
  // called when client recieves a signature
  // introduction returns message to client
  // once client connects their wallet they're prompted to sign message
  // client creates signature with their connected wallet
  // wallet is L1 address returned to client after they connect their wallet
  const argCheck =
    req.body.uuid && req.body.message && req.body.wallet && req.body.signature;

  if (req.method == "POST" && argCheck) {
    let result = {
      session: undefined,
    };

    try {
      //// check message exists
      const client = await clientPromise;
      const database = client.db("verification");
      const messages = database.collection("messages");

      // cleanup expired records
      const expired = new Date().valueOf() - 8.64e7;
      await sessions.deleteMany({ created: { $lt: expired } });

      // return existing record
      const existing = await messages.findOne({
        _id: uuid,
        message: req.body.message,
      });

      if (existing) {
        //// check wallet is hodler
        // check signature is message signed by wallet
      }
      //   const client = await clientPromise;
      //   const database = client.db("verification");
      //   const messages = database.collection("messages");
      //   const sessions = database.collection("sessions");
      //   // cleanup expired records
      //   const expired = new Date().valueOf() - 8.64e+7;
      //   await sessions.deleteMany({ created: { $lt: expired } });
      //   // return existing record
      //   const existing = await messages.findOne({ _id: req.body.uuid });
      //   if (existing) result = { introduction: existing };
      //   // create new record
      //   if (!existing) {
      //     const newMessage = crypto.randomUUID();
      //     await messages.insertOne({
      //       _id: req.body.uuid,
      //       message: newMessage,
      //       created: new Date().valueOf(),
      //     });
      //     // return new record
      //     const confirm = await messages.findOne({ message: newMessage });
      //     result = { introduction: confirm };
      //   }
    } catch (e) {
      console.log(e);
    } finally {
      res.status(200).json(result);
    }
  }
}

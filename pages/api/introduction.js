import clientPromise from "../../lib/mongodb";

import crypto from "crypto";

export default async function handler(req, res) {
  let result = {
    introduction: undefined,
  };

  if (req.method == "POST" && req.body.uuid) {
    try {
      const client = await clientPromise;

      const database = client.db("verification");
      const messages = database.collection("messages");

      // cleanup expired records
      const expired = new Date().valueOf() - 8.64e7; //60000;
      await messages.deleteMany({ created: { $lt: expired } });

      // return existing record
      const existing = await messages.findOne({ _id: req.body.uuid });
      if (existing) result = { introduction: existing };

      // create new record
      if (!existing) {
        const newMessage = `Use of this website is acknowledgement that any data represented is unreliable and does not constitute financial advice. Users of this website assumes all responsibility and risk for the use of this website and it's components.\n\n${crypto.randomUUID()}`;
        await messages.insertOne({
          _id: req.body.uuid,
          message: newMessage,
          created: new Date().valueOf(),
        });

        // return new record
        const confirm = await messages.findOne({ message: newMessage });
        result = { introduction: confirm };
      }
    } catch (e) {
      console.error(e);
    } finally {
      res.status(200).json(result);
    }
  }
}

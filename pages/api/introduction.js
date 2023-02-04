import clientPromise from "../../lib/mongodb";

import crypto from "crypto";

export default async function handler(req, res) {
  let result = {
    introduction: undefined,
  };

  if (
    req.method == "POST" &&
    req.body.uuid &&
    req.body.uuid.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    )
  ) {
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
        const newMessage = await messages.findOne({ name: "config" });

        await messages.insertOne({
          _id: req.body.uuid,
          message: `${newMessage.message}${req.body.uuid}`,
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

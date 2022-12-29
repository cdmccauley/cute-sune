export default async function handler(req, res) {
  let result = {
    account: undefined,
  };

  let argCheck = req.body.key && req.body.wallet;

  if (argCheck && req.body.key == process.env.CUTE_SUNE_API_KEY) {
    const url = `https://api3.loopring.io/api/v3/account?owner=${req.body.wallet}`;

    await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": process.env.LOOPRING_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((payload) => {
        result = {
          account: payload,
        };
      });
  }

  res.status(200).json(result);
}

// Alona 0x59B77f43c35E1b60a10033A38994E9d377367d1c

export default async function handler(req, res) {
  let result = {
    account: undefined,
  };

  const owner = "0x59B77f43c35E1b60a10033A38994E9d377367d1c";
  const url = `https://api3.loopring.io/api/v3/account?owner=${owner}`;

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

  res.status(200).json(result);
}

// Asumi    0x265e9dcc6215b4943f5471a29718aaefdd5b3148c579533410e7357fd044b33e
// Yamamoto    0x23d96e8df4e62ffc49439f416b0684e3fd5b9d7cccddf73aadd107b44f5eaffa
// Morikami    0x2bfb305e41512bceac0f71efba3e2e4a553a341afa5f7be5502b31c62e90fdfa
// Shinju    0x1e172026705448a342c7cc5e8e00b474e6f1621cfb09a11621e1ad5398176cd8
// Odokuro    0x156eae9c915b5300a12a7b4c13f88ff7e7ea08b2f4a689ec129ab60bcc01e975
// Hisui    0x0a8dff58caef384db04e85eed9eb7dbb03df6f6df80caac84ae8c6604498b8c9
// Katana    0x215c32952e02dc4026b712c8848c6d52bf5b6361fe7204f7055400bbfb37ea31

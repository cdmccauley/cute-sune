export default async function handler(req, res) {
  let result = {
    trades: undefined,
  };

  const accountId = "183604";
  const nftData =
    "0x23d96e8df4e62ffc49439f416b0684e3fd5b9d7cccddf73aadd107b44f5eaffa";
  const offset = "0";
  const limit = "50";
  const url = `https://api3.loopring.io/api/v3/user/nft/trades?accountId=${accountId}&nftData=${nftData}&offset=${offset}&limit=${limit}`;

  await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-API-KEY": process.env.LOOPRING_API_KEY,
    },
  })
    .then((response) => response.json())
    .then((payload) => {
      result = {
        trades: payload,
      };
    });

  res.status(200).json(result);
}

// trades
//   totalNum	1
//   trades
//     0
//            0 "383741"
//            1 "0x054ccfb022af6016b91c750ee395e047b0757b435f3b9ccc1d6ee3522abcbed2"
//            2 "0x17d830bb74827faf32ae25874f7d9131218cef5a3538ecdbe53b6daf9be1d79a"
//            3 "0x1f4cadeac60ffb623c12c93408b69cfce7bf66fdbfc63f87001043027b6895bf"
// price      4 "0.040000"
// nftData    5 "0x23d96e8df4e62ffc49439f416b0684e3fd5b9d7cccddf73aadd107b44f5eaffa"
// qty        6 "2"
// tokenIDBS  7 "32811"
//            8 "0"
// sell fee   9 "9800000000000000"
// buy fee   10 "1600000000000000"
// block     11 "32312"
//           12 "375"
// seller    13 "183604"
// buyer     14 "105028"
// storageb? 15 "0"
// storagea? 16 "74"
//           17 "1667604531320"
//           18 "86552"

// Asumi    0x265e9dcc6215b4943f5471a29718aaefdd5b3148c579533410e7357fd044b33e
// Yamamoto    0x23d96e8df4e62ffc49439f416b0684e3fd5b9d7cccddf73aadd107b44f5eaffa
// Morikami    0x2bfb305e41512bceac0f71efba3e2e4a553a341afa5f7be5502b31c62e90fdfa
// Shinju    0x1e172026705448a342c7cc5e8e00b474e6f1621cfb09a11621e1ad5398176cd8
// Odokuro    0x156eae9c915b5300a12a7b4c13f88ff7e7ea08b2f4a689ec129ab60bcc01e975
// Hisui    0x0a8dff58caef384db04e85eed9eb7dbb03df6f6df80caac84ae8c6604498b8c9
// Katana    0x215c32952e02dc4026b712c8848c6d52bf5b6361fe7204f7055400bbfb37ea31
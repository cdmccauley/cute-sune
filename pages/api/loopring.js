// export default async function handler(req, res) {
//     try {
//       const result = await someAsyncOperation()
//       res.status(200).json({ result })
//     } catch (err) {
//       res.status(500).json({ error: 'failed to load data' })
//     }
//   }
  

export default async function handler(req, res) {

    // console.log(req.query)

    // let gs = 'https://api.nft.gamestop.com/nft-svc-marketplace/history?nftData='
    // // let nft = '0xba836091a09eb7e199ce32865efb70a76674e87cf8037d2d5c296ee65bb57616'
    // let nft = '0x23579b59c1f48abc2435245e54b73b0b6f37c3a0c820e408d687a4a1979e6b41'
    // let url = gs + nft
    // // console.log(url)
    // // let url = 'https://api.nft.gamestop.com/nft-svc-marketplace/history?nftData=0x23579b59c1f48abc2435245e54b73b0b6f37c3a0c820e408d687a4a1979e6b41'
    let csRes

    // await fetch(url)
    // .then(response => response.json())
    // .then(payload => {
    //     csRes = payload;
    // })

    // await fetch("https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=0x40f58569af6691117ac0d9df22e295726fd011fdfbff143f1da5f08aae7ff541_0x9d8ddad8f046c7aea4180eb94596f9421c31e622", {
    //     "credentials": "omit",
    //     "headers": {
    //         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
    //         "Accept": "*/*",
    //         "Accept-Language": "en-US,en;q=0.5",
    //         "Sec-Fetch-Dest": "empty",
    //         "Sec-Fetch-Mode": "cors",
    //         "Sec-Fetch-Site": "same-site",
    //         "If-None-Match": "0.35137235677936995"
    //     },
    //     "referrer": "https://nft.gamestop.com/",
    //     "method": "GET",
    //     "mode": "cors"
    // });

    // csRes.loopringNftInfo.nftData[0] to get nft id for history lookup

    // call api/parse?gs=GSURL to get these
    // return looks like { token: '', contract: '' }

    // cape
    let contractAddress = "0x0c589fcd20f99a4a1fe031f50079cfc630015184"
    let tokenId = "0xba836091a09eb7e199ce32865efb70a76674e87cf8037d2d5c296ee65bb57616"

    // cute-sune
    // let tokenId = '0x40f58569af6691117ac0d9df22e295726fd011fdfbff143f1da5f08aae7ff541'
    // let contractAddress = '0x9d8ddad8f046c7aea4180eb94596f9421c31e622'

    let l2IdUrl = 'https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=' + tokenId + '_' + contractAddress

    await fetch(l2IdUrl)
    .then(response => response.json())
    .then(payload => {
        csRes = payload;
    })

    res.status(200).json(csRes)
}
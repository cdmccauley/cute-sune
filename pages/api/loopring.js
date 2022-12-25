export default async function handler(req, res) {
    let result = {
        loopring: undefined
    }

    if (req.query.key && req.query.key === process.env.CUTE_SUNE_API_KEY) {
        if (req.query.contract && req.query.token) {
            let url = `https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=${req.query.token}_${req.query.contract}`
            // overwriting result for the troubleshoot
            await fetch(url, {
                "credentials": "omit",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site"
                },
                "referrer": "https://nft.gamestop.com/",
                "method": "GET",
                "mode": "cors"
            }).then(response => response.json())
            .then(payload => {
                result = payload
            })
        }
    }

    res.status(200).json(result)
}
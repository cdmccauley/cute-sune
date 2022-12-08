export default async function handler(req, res) {
    let result = undefined;

    if (req.query.key && req.query.key === process.env.CUTE_SUNE_API_KEY) {
        if (req.query.nft) {
            let gs = 'https://api.nft.gamestop.com/nft-svc-marketplace/getNftOrders?nftId='
            await fetch(`${gs}${req.query.nft}`, {
                "credentials": "omit",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "If-None-Match": "0.9490703573268132"
                },
                "referrer": "https://nft.gamestop.com/",
                "method": "GET",
                "mode": "cors"
            }).then(response => response.json())
            .then(payload => {
                result = payload;
            })
        }
    }

    res.status(200).json(result)
}
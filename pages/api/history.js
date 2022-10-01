export default async function handler(req, res) {
    console.log('history')
    
    let result = undefined;

    if (req.query.key && req.query.key === process.env.CUTE_SUNE_API_KEY) {
        if (req.query.nft) {
            let gs = 'https://api.nft.gamestop.com/nft-svc-marketplace/history?nftData='
            await fetch(`${gs}${req.query.nft}`)
            .then(response => response.json())
            .then(payload => {
                result = payload;
            })
        }
    }

    res.status(200).json(result)
}
export default async function handler(req, res) {
    let result = {
        loopring: undefined
    }

    if (req.query.key && req.query.key === process.env.CUTE_SUNE_API_KEY) {
        if (req.query.contract && req.query.token) {
            let url = `https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=${req.query.token}_${req.query.contract}`
            await fetch(url)
            .then(response => response.json())
            .then(payload => {
                result = {
                    loopring: payload.loopringNftInfo.nftData[0],
                    metaData: payload.metadataJson
                }
            })
        }
    }

    res.status(200).json(result)
}
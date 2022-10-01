export default async function handler(req, res) {
    console.log('parse')

    let result = { 
        contract: undefined,
        token: undefined
    }

    if (req.query.key && req.query.key === process.env.CUTE_SUNE_API_KEY) {
        if (req.query.gs && req.query.gs.includes("https://nft.gamestop.com/token/")) {
            result = req.query.gs.replace(/https:\/\/nft.gamestop.com\/token\//i, "").split(/\//i)
            result = { 
                contract: result[0],
                token: result[1]
            }
        }
    }

    res.status(200).json(result)
}
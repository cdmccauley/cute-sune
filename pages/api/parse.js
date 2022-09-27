export default async function handler(req, res) {
    // right now only parsing gs url so this can change as more parsing is needed
    let result = { 
        contract: undefined,
        token: undefined
    }

    // check query
    if (req.query.gs && req.query.gs.includes("https://nft.gamestop.com/token/")) {
        // parsing gs url
        result = req.query.gs.replace(/https:\/\/nft.gamestop.com\/token\//i, "").split(/\//i)
        result = { 
            contract: result[0],
            token: result[1]
        }
    }

    res.status(200).json(result)
}
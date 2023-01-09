require('dotenv').config()
const express = require('express')
const { Sdk } = require('etherspot')
const app = express()
const etherspot = new Sdk(process.env.API_KEY)
const axios = require('axios')

app.use(express.json())

app.get('/tokens', async (req, res) => {
	// get dynamic currency
	const currency = req.query.currency
	if (!currency) {
		return res
			.status(400)
			.send({ error: 'Missing required parameter: currency' })
	}
	try {
		// get all tokens from etherspot
		const tokens = await etherspot.getTokenListTokens()
		let tokenItems = tokens.map((t) => t.symbol).slice(0, 500)

		if (tokenItems.length) {
			// coinGecko URL to get dynamic currency record
			const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenItems.join(
				',',
			)}&vs_currencies=${currency}`
			const response = await axios.get(coinGeckoUrl)
			return res.send({ data: { fialValue: response.data, token: tokenItems } })
		}
	} catch (err) {
		return res.status(500).json({
			error: err.message,
		})
	}
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
})

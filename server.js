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
		// get all crypto tokens from etherspot
		const tokens = await etherspot.getTokenListTokens()
		const cryptoRecords = tokens.map((t) => t.symbol)

		if (cryptoRecords.length) {
			// create batch to send data in chunks for coinGecko
			const batchSize = 150
			const numBatches = Math.ceil(cryptoRecords.length / batchSize)
			const coinGeckoALLData = []
			for (let i = 0; i < numBatches; i++) {
				const start = i * batchSize
				const end = start + batchSize
				const batch = cryptoRecords.slice(start, end)
				// coinGecko URL to get dynamic currency record
				const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${batch.join(
					',',
				)}&vs_currencies=${currency}`
				const data = await axios.get(coinGeckoUrl)
				coinGeckoALLData.push(data.data)
			}
			// need data in a single object
			const result = coinGeckoALLData.reduce((acc, curr) => {
				return { ...acc, ...curr }
			}, {})
			return res.send({
				currencyRecords: result,
				cryptoRecords: {
					tokenItems: cryptoRecords,
					totalLength: cryptoRecords.length,
				},
			})
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

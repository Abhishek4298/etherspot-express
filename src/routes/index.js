import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Sdk } from 'etherspot';
import axios from 'axios';
const etherspot = new Sdk(process.env.API_KEY);
const router = express.Router();

router.use((req, res, next) => {
	console.log(`${req.method}:${req.headers.host}${req.originalUrl}`)
	next()
})

router.get('/tokens', async (req, res) => {
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


export default router;

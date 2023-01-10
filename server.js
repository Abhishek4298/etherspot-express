import dotenv from 'dotenv';
import express from 'express';
import router from './src/routes/index.js';
dotenv.config();

const app = express();
app.use(express.json())
app.use('/', router);

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`)
})

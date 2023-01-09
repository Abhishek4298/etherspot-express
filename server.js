const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const axios = require('axios');

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello Etherspot!')
})

app.listen(PORT, () => {
    console.log(`Server is listening at PORT`)
})
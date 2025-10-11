const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// health
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

/* Start server */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Product-APIs server listening at http://localhost:${port}`);
});
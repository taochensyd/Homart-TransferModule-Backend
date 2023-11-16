const express = require('express');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const app = express();

app.use(express.json());

// SAP Session related constants
const SAP_SERVER_URL = 'YOUR_SAP_SERVER_URL';
let sapSessionId;

// Utility function to login to SAP Session
async function loginToSAPSession() {
    // ... (implementation details)
}

// Utility function to keep the SAP session alive
async function keepSAPSessionAlive() {
    // ... (implementation details)
}

// 1. Bin Locations Endpoint
app.post('/api/binlocations', async (req, res) => {
    // ... (implementation details)
});

// 2. Batch in Bin and Qty Endpoint
app.post('/api/batchinbin', async (req, res) => {
    // ... (implementation details)
});

// 3. Journal Memo Endpoint
app.post('/api/journalmemo', async (req, res) => {
    // ... (implementation details)
});

// 4. Stock Transfer Endpoint
app.post('/api/stocktransfer', async (req, res) => {
    // ... (implementation details)
});

// Alternate Stock Transfer Endpoint (commented out)
// app.post('/api/stocktransfer', async (req, res) => {
//     // ... (implementation details)
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    loginToSAPSession();
    setInterval(keepSAPSessionAlive, 1000 * 60 * 15); // 15 minutes interval
});

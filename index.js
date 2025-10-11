import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { getAllProducts, 
            getProductsWithDateFilter,
            getProductsWithBrandFilter,
            getProductsWithPagination,
            getProductsMerged,
            getProductsFromDB,
            returnExcelFile,
            convertImagesToVideo,
            createProduct,
            updateProduct,
            deleteProduct
 } from './controller.js';


const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Step 1: Get all products

// **Requirements:** 
// - Follow the exact casing shown in the response structure above 
// - Return only the fields listed above, no additional fields 
// - Handle null values by passing them as null back to the API caller 
// - Filter out any malformed or error items from the response 
// - All values for the keys in the JSON structure above have to be in the same structure as you receive them from the API. For example the release date field in the response of the get electronics API you call is returned in the format "2024-08-07". 
// In your API's response please return the date in the same format.

app.get('/step1', getAllProducts);
app.get('/step2', getProductsWithDateFilter);
app.get('/step3', getProductsWithBrandFilter);
app.get('/step4', getProductsWithPagination);
app.get('/step5', getProductsMerged);
app.get('/step6', getProductsFromDB);
app.get('/step7/create', createProduct);
app.get('/step7/update/:product_id', updateProduct);
app.get('/step7/delete/:product_id', deleteProduct);
app.get('/step8', returnExcelFile);
app.get('/step9', convertImagesToVideo);

/* Minimal additional endpoints for convenience */
app.get('/health', (req, res) => res.json({ status: 'ok' }));

/* 404 handler */
// app.use((req, res) => res.status(404).json({ error: 'Not found' }));

/* generic error handler */
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

/* Start server */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Product-APIs server listening at http://localhost:${port}`);
});
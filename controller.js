import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import ExcelJS from 'exceljs';

const EXTERNAL_URL = 'http://interview.surya-digital.in/get-electronics';
const GET_BRAND_URL = 'http://interview.surya-digital.in/get-electronics-brands';
const ELECTRONICS_URL = 'http://interview.surya-digital.in/get-electronics';
const BRANDS_URL = 'http://interview.surya-digital.in/get-electronics-brands';
const AXIOS_TIMEOUT = 8000; // ms

// Validate product
const isValidProduct = (item) => {
  if (!item || typeof item !== 'object') return false;
  if (!('productId' in item) || item.productId === undefined || item.productId === null) return false;
  if (!('productName' in item) || item.productName === undefined || item.productName === null) return false;
  if (item.error || item.status === 'error') return false;
  return true;
};

// Map product to required shape
const mapProduct = (item) => ({
  product_id: item.productId ?? null,
  product_name: item.productName ?? null,
  brand_name: item.brandName ?? null,
  category_name: item.category ?? null,
  description_text: item.description ?? null,
  price: item.price ?? null,
  currency: item.currency ?? null,
  processor: item.processor ?? null,
  memory: item.memory ?? null,
  release_date: item.releaseDate ?? null,
  average_rating: item.averageRating ?? null,
  rating_count: item.ratingCount ?? null,
});

// Helper: parse date string, return Date object or null if invalid
const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// Step 1 endpoint
export const getAllProducts = async (req, res) => {
  try {
    const resp = await axios.get(EXTERNAL_URL, { timeout: AXIOS_TIMEOUT });
    let payload = resp.data;

    if (!Array.isArray(payload)) {
      if (payload && typeof payload === 'object' && ('productId' in payload || 'productName' in payload)) {
        payload = [payload];
      } else {
        return res.status(502).json({ error: 'External API returned unexpected format' });
      }
    }

    const cleanedProducts = payload.filter(isValidProduct).map(mapProduct);
    return res.json(cleanedProducts);
  } catch (err) {
    console.error('Error fetching external electronics API:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch electronics data from external provider' });
  }
};

// Step 2 endpoint with release date filters
export const getProductsWithDateFilter = async (req, res) => {
  try {
    const { release_date_start, release_date_end } = req.query;

    // Validate date formats
    const startDate = release_date_start ? parseDate(release_date_start) : null;
    const endDate = release_date_end ? parseDate(release_date_end) : null;

    if ((release_date_start && !startDate) || (release_date_end && !endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format for release_date_start and release_date_end',
      });
    }

    // Fetch all products from external API
    const resp = await axios.get(EXTERNAL_URL, { timeout: AXIOS_TIMEOUT });
    let payload = resp.data;

    if (!Array.isArray(payload)) {
      if (payload && typeof payload === 'object' && ('productId' in payload || 'productName' in payload)) {
        payload = [payload];
      } else {
        return res.status(502).json({ error: 'External API returned unexpected format' });
      }
    }

    // Filter valid products
    let products = payload.filter(isValidProduct);

    // Apply release date filters if provided
    if (startDate || endDate) {
      products = products.filter((p) => {
        if (!p.releaseDate) return false; // skip products without releaseDate
        const pDate = parseDate(p.releaseDate);
        if (!pDate) return false;

        if (startDate && endDate) return pDate >= startDate && pDate <= endDate;
        if (startDate) return pDate >= startDate;
        if (endDate) return pDate <= endDate;
        return true;
      });
    }

    // Map to required structure
    const cleanedProducts = products.map(mapProduct);
    return res.json(cleanedProducts);
  } catch (err) {
    console.error('Error fetching external electronics API:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch electronics data from external provider' });
  }
};


// Step 3 endpoint with release date + brand filters
export const getProductsWithBrandFilter = async (req, res) => {
  try {
    const { release_date_start, release_date_end, brands } = req.query;

    // Validate dates
    const startDate = release_date_start ? parseDate(release_date_start) : null;
    const endDate = release_date_end ? parseDate(release_date_end) : null;

    if ((release_date_start && !startDate) || (release_date_end && !endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD for release_date_start and release_date_end',
      });
    }

    // Parse brands query parameter
    let brandSet = null;
    if (brands) {
      if (typeof brands !== 'string' || !brands.trim()) {
        return res.status(400).json({
          error: 'Invalid brands parameter. Provide comma-separated brand names',
        });
      }
      brandSet = new Set(
        brands.split(',').map((b) => b.trim()).filter((b) => b.length > 0)
      );
      if (brandSet.size === 0) brandSet = null;
    }

    // Fetch all products from external API
    const resp = await axios.get(EXTERNAL_URL, { timeout: AXIOS_TIMEOUT });
    let payload = resp.data;

    if (!Array.isArray(payload)) {
      if (payload && typeof payload === 'object' && ('productId' in payload || 'productName' in payload)) {
        payload = [payload];
      } else {
        return res.status(502).json({ error: 'External API returned unexpected format' });
      }
    }

    // Filter valid products
    let products = payload.filter(isValidProduct);

    // Apply release date filters if provided
    if (startDate || endDate) {
      products = products.filter((p) => {
        if (!p.releaseDate) return false;
        const pDate = parseDate(p.releaseDate);
        if (!pDate) return false;

        if (startDate && endDate) return pDate >= startDate && pDate <= endDate;
        if (startDate) return pDate >= startDate;
        if (endDate) return pDate <= endDate;
        return true;
      });
    }

    // Apply brand filters if provided
    if (brandSet) {
      products = products.filter(
        (p) => p.brandName && brandSet.has(p.brandName)
      );
    }

    // Map to required structure
    const cleanedProducts = products.map(mapProduct);
    return res.json(cleanedProducts);
  } catch (err) {
    console.error('Error fetching external electronics API:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch electronics data from external provider' });
  }
};

// Step 4 endpoint with pagination + date + brand filters
export const getProductsWithPagination = async (req, res) => {
  try {
    const { release_date_start, release_date_end, brands, page_size, page_number } = req.query;

    // Validate mandatory pagination parameters
    const size = parseInt(page_size, 10);
    const page = parseInt(page_number, 10);

    if (!page_size || !page_number || isNaN(size) || isNaN(page) || size <= 0 || page <= 0) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. page_size and page_number must be positive integers starting from 1',
      });
    }

    // Validate dates
    const startDate = release_date_start ? parseDate(release_date_start) : null;
    const endDate = release_date_end ? parseDate(release_date_end) : null;

    if ((release_date_start && !startDate) || (release_date_end && !endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD for release_date_start and release_date_end',
      });
    }

    // Parse brands
    let brandSet = null;
    if (brands) {
      if (typeof brands !== 'string' || !brands.trim()) {
        return res.status(400).json({
          error: 'Invalid brands parameter. Provide comma-separated brand names',
        });
      }
      brandSet = new Set(
        brands.split(',').map((b) => b.trim()).filter((b) => b.length > 0)
      );
      if (brandSet.size === 0) brandSet = null;
    }

    // Fetch products from external API
    const resp = await axios.get(EXTERNAL_URL, { timeout: AXIOS_TIMEOUT });
    let payload = resp.data;

    if (!Array.isArray(payload)) {
      if (payload && typeof payload === 'object' && ('productId' in payload || 'productName' in payload)) {
        payload = [payload];
      } else {
        return res.status(502).json({ error: 'External API returned unexpected format' });
      }
    }

    // Filter valid products
    let products = payload.filter(isValidProduct);

    // Apply release date filters
    if (startDate || endDate) {
      products = products.filter((p) => {
        if (!p.releaseDate) return false;
        const pDate = parseDate(p.releaseDate);
        if (!pDate) return false;

        if (startDate && endDate) return pDate >= startDate && pDate <= endDate;
        if (startDate) return pDate >= startDate;
        if (endDate) return pDate <= endDate;
        return true;
      });
    }

    // Apply brand filters
    if (brandSet) {
      products = products.filter((p) => p.brandName && brandSet.has(p.brandName));
    }

    // Apply pagination
    const startIndex = (page - 1) * size;
    const paginatedProducts = products.slice(startIndex, startIndex + size);

    // Map to required structure
    const cleanedProducts = paginatedProducts.map(mapProduct);
    return res.json(cleanedProducts);

  } catch (err) {
    console.error('Error fetching external electronics API:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch electronics data from external provider' });
  }
};

// Helper: calculate company age from year founded
const calculateCompanyAge = (yearFounded) => {
  if (!yearFounded || isNaN(Number(yearFounded))) return null;
  const currentYear = new Date().getFullYear();
  return currentYear - Number(yearFounded);
};

// Map a product + brand info to the required Step 5 structure
const mapProductWithBrand = (product, brandInfo) => {
  let brand = null;
  if (brandInfo) {
    const addr = brandInfo.address;
    const addressStr = addr
      ? [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')
      : null;
    brand = {
      name: brandInfo.brandName ?? null,
      year_founded: brandInfo.yearFounded ?? null,
      company_age: calculateCompanyAge(brandInfo.yearFounded),
      address: addressStr,
    };
  }

  return {
    product_id: product.productId ?? null,
    product_name: product.productName ?? null,
    brand: brand,
    category_name: product.category ?? null,
    description_text: product.description ?? null,
    price: product.price ?? null,
    currency: product.currency ?? null,
    processor: product.processor ?? null,
    memory: product.memory ?? null,
    release_date: product.releaseDate ?? null,
    average_rating: product.averageRating ?? null,
    rating_count: product.ratingCount ?? null,
  };
};

// Step 5 endpoint
export const getProductsMerged = async (req, res) => {
  try {
    const { release_date_start, release_date_end, brands, page_size, page_number } = req.query;

    // Validate pagination
    const size = parseInt(page_size, 10);
    const page = parseInt(page_number, 10);
    if (!page_size || !page_number || isNaN(size) || isNaN(page) || size <= 0 || page <= 0) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. page_size and page_number must be positive integers starting from 1',
      });
    }

    // Validate dates
    const startDate = release_date_start ? parseDate(release_date_start) : null;
    const endDate = release_date_end ? parseDate(release_date_end) : null;
    if ((release_date_start && !startDate) || (release_date_end && !endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD for release_date_start and release_date_end',
      });
    }

    // Parse brands
    let brandSet = null;
    if (brands) {
      if (typeof brands !== 'string' || !brands.trim()) {
        return res.status(400).json({
          error: 'Invalid brands parameter. Provide comma-separated brand names',
        });
      }
      brandSet = new Set(
        brands.split(',').map((b) => b.trim()).filter((b) => b.length > 0)
      );
      if (brandSet.size === 0) brandSet = null;
    }

    // Fetch both APIs in parallel
    const [electronicsResp, brandsResp] = await Promise.all([
      axios.get(ELECTRONICS_URL, { timeout: AXIOS_TIMEOUT }),
      axios.get(BRANDS_URL, { timeout: AXIOS_TIMEOUT }),
    ]);

    let electronics = electronicsResp.data;
    const brandsData = brandsResp.data;

    // Ensure arrays
    if (!Array.isArray(electronics)) electronics = [electronics];
    if (!Array.isArray(brandsData)) return res.status(502).json({ error: 'Brands API returned unexpected format' });

    // Filter valid products
    let products = electronics.filter(isValidProduct);

    // Apply release date filters
    if (startDate || endDate) {
      products = products.filter((p) => {
        if (!p.releaseDate) return false;
        const pDate = parseDate(p.releaseDate);
        if (!pDate) return false;
        if (startDate && endDate) return pDate >= startDate && pDate <= endDate;
        if (startDate) return pDate >= startDate;
        if (endDate) return pDate <= endDate;
        return true;
      });
    }

    // Apply brand filters
    if (brandSet) {
      products = products.filter((p) => p.brandName && brandSet.has(p.brandName));
    }

    // Pagination
    const startIndex = (page - 1) * size;
    const paginatedProducts = products.slice(startIndex, startIndex + size);

    

    // print brand info
    console.log('Brand Info:', brandsData);

    // Merge with brand info
    const merged = paginatedProducts.map((product) => {
      const brandInfo = brandsData.find((b) => b.brandName === product.brandName) ?? null;
      return mapProductWithBrand(product, brandInfo);
    });


    return res.json(merged);
  } catch (err) {
    console.error('Error fetching or merging APIs:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch or merge data from external APIs' });
  }
};

// Open database
const openDB = async () => {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
};
// Step6 endpoint
export const getProductsFromDB = async (req, res) => {
  try {
    const db = await openDB();
    const { release_date_start, release_date_end, brands, page_size, page_number } = req.query;

    // Validate pagination
    const size = parseInt(page_size, 10);
    const page = parseInt(page_number, 10);
    if (!page_size || !page_number || isNaN(size) || isNaN(page) || size <= 0 || page <= 0) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. page_size and page_number must be positive integers starting from 1',
      });
    }

    // Validate dates
    const startDate = release_date_start ? parseDate(release_date_start) : null;
    const endDate = release_date_end ? parseDate(release_date_end) : null;
    if ((release_date_start && !startDate) || (release_date_end && !endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD for release_date_start and release_date_end',
      });
    }

    // Parse brands
    let brandSet = null;
    if (brands) {
      brandSet = new Set(
        brands.split(',').map((b) => b.trim()).filter((b) => b.length > 0)
      );
      if (brandSet.size === 0) brandSet = null;
    }

    // Build SQL query
    let query = 'SELECT p.*, b.year_founded, b.street, b.city, b.state, b.postal_code, b.country FROM products p LEFT JOIN brands b ON p.brand_name = b.name WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date(p.release_date) >= date(?)';
      params.push(release_date_start);
    }
    if (endDate) {
      query += ' AND date(p.release_date) <= date(?)';
      params.push(release_date_end);
    }
    if (brandSet) {
      const placeholders = Array.from(brandSet).map(() => '?').join(',');
      query += ` AND p.brand_name IN (${placeholders})`;
      params.push(...Array.from(brandSet));
    }

    query += ' ORDER BY p.product_id'; // consistent ordering
    query += ' LIMIT ? OFFSET ?';
    params.push(size, (page - 1) * size);

    const rows = await db.all(query, params);

    // Map rows to response structure
    const response = rows.map((r) => ({
      product_id: r.product_id,
      product_name: r.product_name,
      brand: r.brand_name
        ? {
            name: r.brand_name,
            year_founded: r.year_founded,
            company_age: calculateCompanyAge(r.year_founded),
            address: [r.street, r.city, r.state, r.postal_code, r.country].filter(Boolean).join(', '),
          }
        : null,
      category_name: r.category_name,
      description_text: r.description_text,
      price: r.price,
      currency: r.currency,
      processor: r.processor,
      memory: r.memory,
      release_date: r.release_date,
      average_rating: r.average_rating,
      rating_count: r.rating_count,
    }));

    res.json(response);
  } catch (err) {
    console.error('Database error:', err.message || err);
    return res.status(502).json({ error: 'Failed to fetch products from database' });
  }
};


// Helper: validate product input for create/update
const validateProductInput = (data) => {
  const errors = [];
  if (!data.product_name) errors.push('product_name is required');
  if (!data.brand || !data.brand.name) errors.push('brand.name is required');
  if (!data.category_name) errors.push('category_name is required');
  if (!data.price || isNaN(Number(data.price))) errors.push('price must be a number');
  if (!data.currency) errors.push('currency is required');
  if (!data.release_date || isNaN(new Date(data.release_date))) errors.push('release_date must be a valid date');
  return errors;
};

// POST /step7/create
export const createProduct = async (req, res) => {
  try {
    const db = await openDB();
    const data = req.body;

    const errors = validateProductInput(data);
    if (errors.length) return res.status(400).json({ errors });

    // Insert brand if not exists
    const brand = data.brand;
    await db.run(
      `INSERT OR IGNORE INTO brands (name, year_founded, street, city, state, postal_code, country) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        brand.name,
        brand.year_founded || null,
        ...(brand.address ? brand.address.split(',').map(s => s.trim()) : [null, null, null, null, null])
      ]
    );

    // Insert product
    const result = await db.run(
      `INSERT INTO products 
       (product_name, brand_name, category_name, description_text, price, currency, processor, memory, release_date, average_rating, rating_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.product_name,
        brand.name,
        data.category_name,
        data.description_text || null,
        data.price,
        data.currency,
        data.processor || null,
        data.memory || null,
        data.release_date,
        data.average_rating || null,
        data.rating_count || null
      ]
    );

    const newProduct = await db.get('SELECT * FROM products WHERE product_id = ?', [result.lastID]);

    res.status(201).json({ message: 'Product created', product_id: newProduct.product_id });
  } catch (err) {
    console.error('DB Create Error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// PUT /step7/update/:product_id
export const updateProduct = async (req, res) => {
  try {
    const db = await openDB();
    const { product_id } = req.params;
    const data = req.body;

    const existing = await db.get('SELECT * FROM products WHERE product_id = ?', [product_id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const errors = validateProductInput(data);
    if (errors.length) return res.status(400).json({ errors });

    const brand = data.brand;
    // Update or insert brand
    await db.run(
      `INSERT OR IGNORE INTO brands (name, year_founded, street, city, state, postal_code, country) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        brand.name,
        brand.year_founded || null,
        ...(brand.address ? brand.address.split(',').map(s => s.trim()) : [null, null, null, null, null])
      ]
    );

    // Update product
    await db.run(
      `UPDATE products SET
       product_name = ?, brand_name = ?, category_name = ?, description_text = ?, price = ?, currency = ?, processor = ?, memory = ?, release_date = ?, average_rating = ?, rating_count = ?
       WHERE product_id = ?`,
      [
        data.product_name,
        brand.name,
        data.category_name,
        data.description_text || null,
        data.price,
        data.currency,
        data.processor || null,
        data.memory || null,
        data.release_date,
        data.average_rating || null,
        data.rating_count || null,
        product_id
      ]
    );

    res.status(200).json({ message: 'Product updated', product_id });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE /step7/delete/:product_id
export const deleteProduct = async (req, res) => {
  try {
    const db = await openDB();
    const { product_id } = req.params;

    const existing = await db.get('SELECT * FROM products WHERE product_id = ?', [product_id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await db.run('DELETE FROM products WHERE product_id = ?', [product_id]);

    res.status(204).send();
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// ## Step 8: Return an Excel File
export const returnExcelFile = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Return an Excel file endpoint' });
}

// ## Step 9: Convert Images to Video
export const convertImagesToVideo = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Convert images to video endpoint' });
}
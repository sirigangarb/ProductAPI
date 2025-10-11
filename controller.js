import axios from 'axios';

const EXTERNAL_URL = 'http://interview.surya-digital.in/get-electronics';
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


// ## Step 3: Add Brand Filters
export const addBrandFilters = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Add brand filters endpoint' });
};

// ## Step 4: Pagination
export const addPagination = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Add pagination endpoint' });
};

// ## Step 5: Joining the Response of Two APIs
export const joinApiResponses = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Join API responses endpoint' });
}

// ## Step 6: Use a SQLite Database
export const useSQLiteDatabase = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Use SQLite database endpoint' });
}


// ## Step 7: Implement CRUD APIs
export const implementCRUD = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Implement CRUD APIs endpoint' });
}

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
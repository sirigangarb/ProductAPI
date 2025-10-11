import axios from 'axios';

const EXTERNAL_URL = 'http://interview.surya-digital.in/get-electronics';
const AXIOS_TIMEOUT = 8000; // ms

// Helper: check if a product is valid
const isValidProduct = (item) => {
  if (!item || typeof item !== 'object') return false;
  if (!('productId' in item) || item.productId === undefined || item.productId === null) return false;
  if (!('productName' in item) || item.productName === undefined || item.productName === null) return false;
  if (item.error || item.status === 'error') return false;
  return true;
};

// Map raw product to required shape
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

export const getAllProducts = async (req, res) => {
  try {
    const resp = await axios.get(EXTERNAL_URL, { timeout: AXIOS_TIMEOUT });
    let payload = resp.data;

    // Ensure payload is an array
    if (!Array.isArray(payload)) {
      // Handle single object case
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
    return res.status(502).json({
      error: 'Failed to fetch electronics data from external provider',
    });
  }
};


// addReleaseDateFilters
export const addReleaseDateFilters = (req, res) => {
    // Placeholder implementation
    res.json({ message: 'Add release date filters endpoint' });
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
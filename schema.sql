-- brands table
CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    year_founded INTEGER,
    street TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT
);

-- products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand_name TEXT,
    category_name TEXT,
    description_text TEXT,
    price REAL,
    currency TEXT,
    processor TEXT,
    memory TEXT,
    release_date TEXT,
    average_rating REAL,
    rating_count INTEGER,
    FOREIGN KEY (brand_name) REFERENCES brands(name)
);

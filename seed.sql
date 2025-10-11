INSERT INTO brands (name, year_founded, street, city, state, postal_code, country)
VALUES 
('Quantum', 2005, '123 Innovation Drive', 'Sanjose', 'California', '95113', 'USA'),
('Stellar', 2010, '456 Tech Park', 'Austin', 'Texas', '78701', 'USA'),
('Aura', 2015, '789 Digital Ave', 'Seattle', 'Washington', '98101', 'USA');

INSERT INTO products (product_id, product_name, brand_name, category_name, description_text, price, currency, processor, memory, release_date, average_rating, rating_count)
VALUES
('P001', 'Quantum Laptop X', 'Quantum', 'Laptop', 'High performance laptop', 1200, 'USD', 'Intel i7', '16GB', '2024-01-15', 4.5, 120),
('P002', 'Stellar Phone Z', 'Stellar', 'Smartphone', 'Flagship smartphone', 800, 'USD', 'Snapdragon 8', '8GB', '2024-03-10', 4.7, 95),
('P003', 'Aura Tablet S', 'Aura', 'Tablet', 'Lightweight tablet', 500, 'USD', 'Apple A14', '6GB', '2024-06-20', 4.3, 70);

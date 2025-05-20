import React from 'react';
import AddToCartButton from '../components/AddToCartButton';
import './CategoryPage.css';

// Sample product data - in a real app, this would come from an API
const products = [
  {
    id: 'prod_1',
    name: 'Mindful Hoodie',
    price: 89.99,
    description: 'Ultra-soft hoodie made from organic cotton blend, perfect for meditation and relaxation.',
    image: 'https://via.placeholder.com/300x300?text=Mindful+Hoodie',
  },
  {
    id: 'prod_2',
    name: 'Zen Joggers',
    price: 64.99,
    description: 'Comfortable joggers designed for both movement and meditation.',
    image: 'https://via.placeholder.com/300x300?text=Zen+Joggers',
  },
  {
    id: 'prod_3',
    name: 'Serenity T-Shirt',
    price: 34.99,
    description: 'Breathable t-shirt made from sustainable bamboo fabric.',
    image: 'https://via.placeholder.com/300x300?text=Serenity+T-Shirt',
  },
  {
    id: 'prod_4',
    name: 'Balance Leggings',
    price: 59.99,
    description: 'High-waisted leggings with four-way stretch for ultimate comfort.',
    image: 'https://via.placeholder.com/300x300?text=Balance+Leggings',
  },
];

const Apparel: React.FC = () => {
  return (
    <div className="category-page">
      <header className="category-header">
        <h1>RESZEN8 Apparel</h1>
        <p className="subtitle">Premium comfort wear designed for your wellness journey</p>
      </header>

      <section className="category-content">
        <div className="category-intro">
          <p>Our apparel collection is crafted with intention, using sustainable materials that respect both your body and the planet. Each piece is designed to accompany you through meditation, movement, and moments of mindfulness.</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-4">{product.description}</p>
                <AddToCartButton product={product} className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .product-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .product-image {
          width: 100%;
          height: 0;
          padding-bottom: 100%;
          position: relative;
          overflow: hidden;
        }
        
        .product-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

export default Apparel;

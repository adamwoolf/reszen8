import React, { useState } from "react";
import AddToCartButton from "../components/AddToCartButton";
import SizeDropdownSelector from "../components/SizeDropdownSelector";
import "./CategoryPage.css";
import { useBasketStore } from "../store/basketStore";

// Sample product data - in a real app, this would come from an API
const products = [
  // Apparel Products
  {
    id: "prod_1",
    name: "Mindful Hoodie",
    price: 39.99,
    description: "Ultra-soft hoodie made from organic cotton blend, perfect for meditation and relaxation.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "prod_2",
    name: "Zen Joggers",
    price: 28.99,
    description: "Comfortable joggers designed for both movement and meditation.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "prod_3",
    name: "Serenity T-Shirt",
    price: 24.99,
    description: "Breathable t-shirt made from sustainable bamboo fabric.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "prod_4",
    name: "Balance Leggings",
    price: 38.99,
    description: "High-waisted leggings with four-way stretch for ultimate comfort.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  // Accessories Products
  {
    id: "acc_1",
    name: "Intention Bracelet",
    price: 18.0,
    description: "Handcrafted from sustainable materials with an adjustable design.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
  },
  {
    id: "acc_2",
    name: "Reflection Journal",
    price: 22.5,
    description: "Premium journal with guided prompts for daily mindfulness practice.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
  },
  {
    id: "acc_3",
    name: "Meditation Cushion",
    price: 54.99,
    description: "Ergonomic cushion filled with buckwheat hulls for optimal support.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
  },
  {
    id: "acc_4",
    name: "Essential Oil Diffuser",
    price: 32.99,
    description: "Whisper-quiet diffuser with color-changing LED lights for a calming atmosphere.",
    image: "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg",
  },
];

type SizeQuantity = {
  size: string;
  quantity: number;
};

const Apparel: React.FC = () => {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: SizeQuantity[] }>({});
  const [showSizePrompt, setShowSizePrompt] = useState<{ [key: string]: boolean }>({});
  const { items, addItem, removeItem, updateQuantity } = useBasketStore();

  // const handleSizeQuantityChange = (productId: string, sizes: SizeQuantity[]) => {
  //   setSelectedSizes((prev) => ({
  //     ...prev,
  //     [productId]: sizes,
  //   }));

  //   // Reset the size prompt when sizes are selected
  //   if (showSizePrompt[productId] && sizes.length > 0) {
  //     setShowSizePrompt((prev) => ({
  //       ...prev,
  //       [productId]: false,
  //     }));
  //   }
  // };

  const handleSizeRequired = (productId: string) => {
    setShowSizePrompt((prev) => ({
      ...prev,
      [productId]: true,
    }));

    // Auto-hide the prompt after 3 seconds
    setTimeout(() => {
      setShowSizePrompt((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }, 3000);

    // Scroll the product into view if needed
    const productElement = document.getElementById(`product-${productId}`);
    if (productElement) {
      productElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // const getTotalQuantity = (productId: string) => {
  //   return (selectedSizes[productId] || []).reduce((total, item) => total + item.quantity, 0);
  // };

  const addToBasket = (product, size, i) => {
    console.log("adding", product, size);
    const productWithSize = {
      ...product,
      size,
      // Add a unique ID for each line item to handle duplicates
      lineItemId: `${product.id}-${size}-${i}-${Date.now()}`,
    };
    addItem(productWithSize);
  };

  const handleQuantityChange = (product, size, i, plusOrMin) => {
    const item = items.find((item) => item.product.id === product.id && item.product.size === size);
    if (!item) {
      addToBasket(product, size, i);
    } else {
      const newQ = plusOrMin === "plus" ? item.quantity + 1 : item.quantity - 1;
      if (newQ < 1) return removeItem(product.id, size);

      updateQuantity(product.id, size, newQ);
    }
  };

  const renderDropdown = (product) => {
    return (
      <div onChange={(e) => e.preventDefault()}>
        <div>select size and quantity</div>
        {product?.sizes?.map((size, i) => {
          const numInBasket = items.find((item) => item.product.id === product.id && item.product.size === size)
            ?.quantity;
          return (
            <div value={size} className='product-select-item' key={size}>
              <button onClick={() => handleQuantityChange(product, size, i, "min")}>{"-"}</button>
              <span style={{ margin: "0 40px" }}>
                {" "}
                {size} {numInBasket && `(${numInBasket})`}
              </span>{" "}
              <button onClick={() => handleQuantityChange(product, size, i, "plus")}>{"+"}</button>{" "}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className='category-page'>
      <header className='category-header'>
        <h1>RESZEN8 Apparel</h1>
        <p className='subtitle'>Premium apparel and accessories designed for your wellness journey</p>
      </header>

      <section className='category-content'>
        <div className='category-intro'>
          <p>
            Complete your wellness toolkit with our thoughtfully designed accessories and apparel. From journals to
            jewelry, each item blends beauty and function to support mindfulness throughout your day. Our sustainable
            comfort wear is crafted to accompany you through meditation, movement, and everyday wellness.
          </p>
        </div>

        <div className='products-grid'>
          {products.map((product) => (
            <div key={product.id} id={`product-${product.id}`} className='product-card relative'>
              {showSizePrompt[product.id] && product.sizes && (
                <div className='absolute -top-2 left-0 right-0 transform -translate-y-full'>
                  <div className='bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm rounded'>
                    <p>Please select at least one size and quantity</p>
                  </div>
                </div>
              )}
              <div className='product-image'>
                <img src={product.image} alt={product.name} className='w-full h-64 object-cover' />
              </div>
              <div className='p-4 flex flex-col h-full'>
                <h3 className='text-xl font-semibold mb-2'>{product.name}</h3>
                <p className='text-gray-600 mb-2'>£{product.price.toFixed(2)}</p>
                <p className='text-sm text-gray-500 mb-4'>{product.description}</p>
                {renderDropdown(product)}
                {/* {product.sizes && (
                  <div className="mb-4">
                    <SizeDropdownSelector
                      sizes={product.sizes}
                      selectedSizes={selectedSizes[product.id] || []}
                      onSizeQuantityChange={(sizes) => 
                        handleSizeQuantityChange(product.id, sizes)
                      }
                    />
                  </div>
                )} */}

                {/* <div className='mt-auto'>
                  <AddToCartButton
                    product={product}
                    className='w-full max-w-[200px] mx-auto block'
                    selectedSizes={selectedSizes[product.id] || []}
                    onSizeRequired={() => handleSizeRequired(product.id)}
                  />
                </div> */}
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

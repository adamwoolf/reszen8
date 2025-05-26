import React, { useState, useEffect } from "react";
import "../CategoryPage.css";
import "./ApparelStyles.css";
import { useBasketStore } from "../../store/basketStore";
import { getStoreItems } from "../../contentful";

type SizeQuantity = {
  size: string;
  quantity: number;
};

const Apparel: React.FC = () => {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: SizeQuantity[] }>({});
  const [showSizePrompt, setShowSizePrompt] = useState<{ [key: string]: boolean }>({});
  const { items, addItem, removeItem, updateQuantity } = useBasketStore();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    getStoreItems().then((data) => {
      setProducts(
        data.map((item) => {
          return {
            ...item.fields,
            sizes: item?.fields?.sizes?.sizes,
            id: item.sys.id,
          };
        })
      );
    });
  }, []);

  const addToBasket = (product, size, i) => {
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

    if (!item?.quantity && plusOrMin === "min") return;
    if (!item && plusOrMin === "plus") {
      addToBasket(product, size, i);
    } else if (item) {
      const newQ = plusOrMin === "plus" ? item.quantity + 1 : item.quantity - 1;
      if (newQ < 1 && plusOrMin === "min") return removeItem(product.id, size);
      updateQuantity(product.id, size, newQ);
    }
  };

  const renderDropdown = (product) => {
    console.log(product);
    if (!product.sizes) {
      const numInBasket = items.find((item) => item.product.id === product.id)?.quantity;
      return (
        <div className='product-select-item'>
          <button onClick={() => handleQuantityChange(product, null, 1, "min")}>{"-"}</button>
          <span>Add to basket {numInBasket && `(${numInBasket})`}</span>
          <button onClick={() => handleQuantityChange(product, null, 1, "plus")}>{"+"}</button>{" "}
        </div>
      );
    }
    return (
      <div onChange={(e) => e.preventDefault()}>
        <div>select size and quantity</div>
        {product?.sizes?.map((size, i) => {
          const numInBasket = items.find((item) => item.product.id === product.id && item.product.size === size)
            ?.quantity;
          return (
            <div value={size} className='product-select-item' key={size}>
              <button onClick={() => handleQuantityChange(product, size, i, "min")}>{"-"}</button>
              <span>
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
        <h1>Apparel & Accessories</h1>
        <p className='subtitle'>
          Our apparel & accessories collection features thoughtfully designed items that enhance your relaxation
          practice and bring mindfulness into everyday moments. Each piece combines aesthetic appeal with practical
          function, creating objects that are as beautiful as they are useful.
        </p>
      </header>

      <section className='category-content'>
        <div className='category-intro'>
          <p>
            At RESZEN8, we carefully curate tools that enhance your mindfulness practice and support your journey to
            balance. Each item is selected for its quality, effectiveness, and alignment with our philosophy of
            intentional living.
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
                <img
                  src={product.image || "https://i.ibb.co/kgZ2j4Fm/Apparel-Placeholder.jpg"}
                  alt={product.name}
                  className='w-full h-64 object-cover'
                />
              </div>
              <div className='p-4 flex flex-col h-full'>
                <h3 className='text-xl font-semibold mb-2'>{product.name}</h3>
                <p className='text-gray-600 mb-2'>£{product.price.toFixed(2)}</p>
                <p className='text-sm text-gray-500 mb-4'>{product.description}</p>
                {renderDropdown(product)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Apparel;

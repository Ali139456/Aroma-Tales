import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useProducts } from './ProductsContext';
import {
  getEffectivePrices,
  getTrackedStock,
  cartUnitsForProduct,
  cartUnitsForProductExcept,
} from '../lib/productMapper';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { products, loading } = useProducts();
  const validIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  const [cart, setCart] = useState([]);
  const hydrated = useRef(false);

  useEffect(() => {
    if (loading) return;

    const savedCart = localStorage.getItem('aroma_tales_cart');
    const parsed = savedCart ? JSON.parse(savedCart) : [];
    const safe = Array.isArray(parsed)
      ? parsed.filter((item) => item?.id && validIds.has(item.id))
      : [];

    if (!hydrated.current) {
      setCart(safe);
      hydrated.current = true;
      return;
    }

    setCart((prev) => prev.filter((item) => validIds.has(item.id)));
  }, [loading, validIds]);

  useEffect(() => {
    if (!hydrated.current || loading) return;
    localStorage.setItem('aroma_tales_cart', JSON.stringify(cart));
  }, [cart, loading]);

  const addToCart = (product, size) => {
    const { price, price30ml } = getEffectivePrices(product);
    const adjustedPrice = size === '30ml' ? price30ml : price;
    const productWithAdjustedPrice = { ...product, price: adjustedPrice };
    const cap = getTrackedStock(productWithAdjustedPrice);

    setCart((prevCart) => {
      const used = cartUnitsForProduct(prevCart, product.id);
      if (cap != null && used >= cap) return prevCart;

      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        const others = cartUnitsForProductExcept(prevCart, product.id, size);
        const room = cap == null ? Infinity : Math.max(0, cap - others);
        if (existingItem.quantity + 1 > room) return prevCart;
        return prevCart.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      if (cap != null && used + 1 > cap) return prevCart;

      return [...prevCart, { ...productWithAdjustedPrice, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity < 1) return;
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === productId && i.size === size);
      if (!item) return prevCart;
      const cap = getTrackedStock(item);
      const others = cartUnitsForProductExcept(prevCart, productId, size);
      const room = cap == null ? Infinity : Math.max(0, cap - others);
      const next = Math.min(quantity, room);
      if (next < 1) {
        return prevCart.filter((i) => !(i.id === productId && i.size === size));
      }
      return prevCart.map((i) =>
        i.id === productId && i.size === size ? { ...i, quantity: next } : i
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

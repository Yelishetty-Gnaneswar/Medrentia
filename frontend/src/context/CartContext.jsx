import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { getExactMedicalImage } from '../utils/imageFallback';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('medrentia_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Sync with backend on auth change
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/cart');
          if (res.data.success && res.data.data?.items) {
            setCartItems(res.data.data.items);
          }
        } catch (err) {
          console.error('Failed to sync cart from server:', err);
        }
      }
    };
    syncCart();
  }, [isAuthenticated]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('medrentia_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const calculateItemPrice = (equipment, duration, units = 1) => {
    let base = equipment.dailyPrice || 100;
    if (duration === 'weekly') base = equipment.weeklyPrice || base * 6;
    if (duration === 'monthly') base = equipment.monthlyPrice || base * 22;
    if (duration === 'sixMonth') base = equipment.sixMonthPrice || Math.round((equipment.monthlyPrice || base * 22) * 5.2);
    if (duration === 'yearly') base = equipment.yearlyPrice || Math.round((equipment.monthlyPrice || base * 22) * 9.5);
    return base * units;
  };

  const calculateEndDate = (startDate, duration, units = 1) => {
    const end = new Date(startDate || Date.now());
    if (duration === 'daily') end.setDate(end.getDate() + (1 * units));
    else if (duration === 'weekly') end.setDate(end.getDate() + (7 * units));
    else if (duration === 'monthly') end.setMonth(end.getMonth() + (1 * units));
    else if (duration === 'sixMonth') end.setMonth(end.getMonth() + (6 * units));
    else if (duration === 'yearly') end.setFullYear(end.getFullYear() + (1 * units));
    else end.setDate(end.getDate() + 7);
    return end;
  };

  const addToCart = async (equipment, rentalDuration = 'weekly', durationUnits = 1, quantity = 1, startDate = new Date()) => {
    const calculatedPrice = calculateItemPrice(equipment, rentalDuration, durationUnits) * quantity;
    const deposit = (equipment.securityDeposit || 1000) * quantity;
    const endDate = calculateEndDate(startDate, rentalDuration, durationUnits);

    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.post('/cart', {
          equipmentId: equipment._id,
          rentalDuration,
          durationUnits,
          quantity,
          rentalStartDate: startDate,
        });
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        console.error('Add to cart server error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Local cart
      setCartItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) => (item.equipment?._id || item.equipment) === equipment._id && item.rentalDuration === rentalDuration
        );

        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          updated[existingIdx].rentalPrice = calculateItemPrice(equipment, rentalDuration, updated[existingIdx].durationUnits || 1) * updated[existingIdx].quantity;
          updated[existingIdx].securityDeposit = (equipment.securityDeposit || 1000) * updated[existingIdx].quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              _id: 'local_' + Date.now(),
              equipment: equipment,
              equipmentName: equipment.name,
              equipmentImage: equipment.images?.[0] || getExactMedicalImage(equipment.name, equipment.categoryName),
              categoryName: equipment.categoryName,
              rentalDuration,
              durationUnits,
              quantity,
              rentalPrice: calculatedPrice,
              securityDeposit: deposit,
              deliveryFee: equipment.deliveryFee || 150,
              rentalStartDate: new Date(startDate),
              rentalEndDate: endDate,
              provider: equipment.provider,
              providerName: equipment.providerName,
            },
          ];
        }
      });
    }
  };

  const updateCartItem = async (itemId, rentalDuration, durationUnits = 1, quantity) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.put(`/cart/${itemId}`, { rentalDuration, durationUnits, quantity });
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        console.error('Update cart item server error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          if (item._id === itemId) {
            const eq = item.equipment || {};
            const newQty = quantity !== undefined ? Math.max(1, quantity) : item.quantity;
            const newDuration = rentalDuration || item.rentalDuration;
            const newUnits = durationUnits !== undefined ? durationUnits : item.durationUnits;
            const newPrice = calculateItemPrice(eq, newDuration, newUnits) * newQty;
            const newDeposit = (eq.securityDeposit || item.securityDeposit / item.quantity || 1000) * newQty;
            const newEndDate = calculateEndDate(item.rentalStartDate, newDuration, newUnits);

            return {
              ...item,
              rentalDuration: newDuration,
              durationUnits: newUnits,
              quantity: newQty,
              rentalPrice: newPrice,
              securityDeposit: newDeposit,
              rentalEndDate: newEndDate,
            };
          }
          return item;
        })
      );
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.delete(`/cart/${itemId}`);
        if (res.data.success && res.data.data?.items) {
          setCartItems(res.data.data.items);
        }
      } catch (err) {
        console.error('Remove cart item server error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Clear cart server error:', err);
      }
    }
    setCartItems([]);
    localStorage.removeItem('medrentia_cart');
  };

  // Financial Calculations in ₹ (INR)
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.rentalPrice || 0), 0);
  const cartDeposit = cartItems.reduce((acc, item) => acc + (item.securityDeposit || 0), 0);
  const cartDeliveryFee = cartItems.length > 0 ? Math.max(...cartItems.map((i) => i.deliveryFee || 150)) : 0;
  const cartTax = Math.round(cartSubtotal * 0.18); // 18% GST
  const cartGrandTotal = Math.round(cartSubtotal + cartDeposit + cartDeliveryFee + cartTax);
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    cartDeposit,
    cartDeliveryFee,
    cartTax,
    cartGrandTotal,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

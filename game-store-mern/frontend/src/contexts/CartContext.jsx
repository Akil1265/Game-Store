import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { pickGameImage, resolveImageUrl } from '../utils/image';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.gameId === action.payload.gameId
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, qty: item.qty + action.payload.qty }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.qty, 0);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.gameId === action.payload.gameId
          ? { ...item, qty: action.payload.qty }
          : item
      );
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.qty, 0);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.gameId !== action.payload);
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.qty, 0);
      
      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (game, qty = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        gameId: game._id,
        title: game.title,
        price: game.price,
        coverImage: pickGameImage(game) || '',
        image:
          resolveImageUrl(game.images?.[0]) ||
          resolveImageUrl(game.coverImage) ||
          resolveImageUrl(game.screenshots?.[0]) ||
          '',
        slug: game.slug,
        stock: game.stock,
        qty
      }
    });
  };

  const updateItem = (gameId, qty) => {
    if (qty <= 0) {
      removeItem(gameId);
    } else {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: { gameId, qty }
      });
    }
  };

  const removeItem = (gameId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: gameId
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQty = (gameId) => {
    const item = state.items.find(item => item.gameId === gameId);
    return item ? item.qty : 0;
  };

  const value = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemQty
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

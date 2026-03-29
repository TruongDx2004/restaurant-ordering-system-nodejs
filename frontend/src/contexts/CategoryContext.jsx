import React, { createContext, useContext, useState } from 'react';

/**
 * Category Context
 * Quản lý selected category state global
 */
const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
  };

  const value = {
    selectedCategory,
    selectCategory,
    clearCategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { Banner } from './components/Banner';
import { DishList } from './components/DishList';
import { Footer } from './components/Footer';
import { useDishes } from './hooks';
import { useCategories } from './hooks';
import { useSearch as useSearchContext } from '../../../contexts/SearchContext';
import { useCategory } from '../../../contexts/CategoryContext';
import { dishApi } from '../../../api/dishApi';
import { DesktopWarning } from '../../../components/shared';
import styles from './index.module.css';

/**
 * CustomerHome Component
 * Main page for customer - Browse menu grouped by categories
 * Note: Header and CategoryNav are now in CustomerLayout (sticky header)
 */
export const CustomerHome = () => {
  // State management
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dishesByCategory, setDishesByCategory] = useState({});

  // Get global contexts
  const { searchQuery } = useSearchContext();
  const { selectedCategory } = useCategory();
  
  // Fetch all categories and all available dishes
  const { categories, loading: categoriesLoading } = useCategories();
  const { dishes, loading: dishesLoading } = useDishes(null, true); // Get all available dishes
  
  // Group dishes by category
  // Dish structure: { id, name, price, status, image, category: { id, name } }
  useEffect(() => {
    if (!dishes || dishes.length === 0) {
      setDishesByCategory({});
      return;
    }
    
    const grouped = {};
    dishes.forEach(dish => {
      // Lấy category ID từ dish.category.id (structure mới từ backend)
      const catId = dish.category?.id || dish.categoryId || 'uncategorized';
      if (!grouped[catId]) {
        grouped[catId] = [];
      }
      grouped[catId].push(dish);
    });

    setDishesByCategory(grouped);
  }, [dishes, categories]);

  // Scroll to category section when selected
  useEffect(() => {
    if (selectedCategory && !searchQuery) {
      const element = document.getElementById(`category-${selectedCategory}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedCategory, searchQuery]);
  
  // Search for dishes when searchQuery changes
  useEffect(() => {
    const searchDishes = async () => {
      if (!searchQuery || !searchQuery.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const response = await dishApi.search(searchQuery);
        setSearchResults(response.success ? response.data : []);
      } catch (error) {
        console.error('Error searching dishes:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    searchDishes();
  }, [searchQuery]);

  const isLoading = searching || dishesLoading || categoriesLoading;

  return (
    <>
      <DesktopWarning />
      <div className={styles.customerHome}>
      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Banner - Only show when not searching */}
        {!searchQuery && <Banner />}

        {/* Search Results */}
        {searchQuery && (
          <div className={styles.searchSection}>
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>
                Kết quả tìm kiếm cho "{searchQuery}"
              </h2>
              <p className={styles.searchCount}>
                {searchResults.length} món ăn
              </p>
            </div>

            <DishList
              dishes={searchResults}
              loading={searching}
              emptyMessage={`Không tìm thấy món ăn nào với từ khóa "${searchQuery}"`}
            />
          </div>
        )}

        {/* Category Sections - Show when not searching */}
        {!searchQuery && (
          <div className={styles.categorySections}>
            {isLoading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Đang tải thực đơn...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-utensils"></i>
                <p>Hiện tại chưa có danh mục nào</p>
              </div>
            ) : (
              categories.map(category => {
                console.log(`Processing category: ${category.name} (ID: ${category.id})`);
                const categoryDishes = dishesByCategory[category.id] || [];
                console.log(`Rendering category ${category.name} with ${categoryDishes.length} dishes`);
                
                // Skip empty categories
                if (categoryDishes.length === 0) return null;
                return (
                  <section
                    key={category.id}
                    id={`category-${category.id}`}
                    className={styles.categorySection}
                  >
                    {/* Category Header */}
                    <div className={styles.categorySectionHeader}>
                      <h2 className={styles.categoryTitle}>{category.name}</h2>
                      {category.description && (
                        <p className={styles.categoryDescription}>{category.description}</p>
                      )}
                      <div className={styles.categoryDivider}></div>
                    </div>

                    {/* Dishes in this category */}
                    <DishList
                      dishes={categoryDishes}
                      loading={false}
                    />
                  </section>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <Footer />
      </main>
    </div>
    </>
  );
};

export default CustomerHome;

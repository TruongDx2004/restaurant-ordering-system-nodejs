import React, { useState, useEffect } from 'react';
import styles from './Banner.module.css';

/**
 * Banner Component
 * Banner với hero image và promotional slider
 */
export const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Promotional slides
  const slides = [
    '/storage/dish/ad1.jpg',
    '/storage/dish/ad2.jpg',
    '/storage/dish/ad3.jpg'
  ];

  useEffect(() => {
    // Auto slide every 3 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className={styles.banner}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <img 
          src="/storage/dish/banner.jpg" 
          alt="Restaurant Banner" 
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroText}>
            <h2 className={styles.heroTitle}>Chào mừng đến với</h2>
            <h1 className={styles.heroSubtitle}>Nhà hàng của chúng tôi!</h1>
            <p className={styles.heroDescription}>
              Thưởng thức những món ăn ngon nhất ngay hôm nay.
            </p>
          </div>
        </div>
      </div>

      {/* Promotional Slider */}
      <div className={styles.promotionSection}>
        <div className={styles.slider}>
          <div className={styles.slides}>
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                <img 
                  src={slide} 
                  alt={`Promotion ${index + 1}`}
                  className={styles.slideImage}
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className={styles.dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;

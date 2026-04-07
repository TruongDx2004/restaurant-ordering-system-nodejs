import React, { useState, useEffect } from 'react';
import styles from './Banner.module.css';

const SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

export const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    `${SERVER_URL}/uploads/promo1.png`,
    `${SERVER_URL}/uploads/promo2.png`,
    `${SERVER_URL}/uploads/promo3.png`
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
          src={`${SERVER_URL}/uploads/hero.png`}
          alt="Restaurant Banner"
          className={styles.heroImage}
        />
      </div>

      {/* Promotional Slider */}
      <div className={styles.promotionSection}>
        <div className={styles.slider}>
          <div
            className={styles.slides}
            style={{ transform: `translateX(-${currentSlide * 120}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={styles.slide}
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

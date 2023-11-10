"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import "./carousel.scss";
import { useCarousel } from "./useCarousel";
import useCarouselNew from "./useCarouselNew";
const SLIDES_COUNT = 5;
const imageUrls = [
  "TCpfPxKPOvk",
  "WLUHO9A_xik",
  "random",
  "user/erondu",
  "?nature,water",
  "collection/190727",
  "user/traceofwind/likes",
];

const wraparound = (index: number, length: number) => {
  if (index < 0) {
    return length - 1;
  }
  if (index >= length) {
    return 0;
  }
  return index;
};

export default function Home() {
  // remove no-js class on load
  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");
  }, []);
  const [isSlideShow, setIsSlideShow] = useState(false);
  const { currentIndex, navigateToNextItem, scrollContainerRef, edges } =
    useCarouselNew({
      slidesCount: SLIDES_COUNT,
    });

  return (
    <main className={styles.main}>
      <a href="#next-section" className="skip-link">
        Skip to next section
      </a>
      <button onClick={() => setIsSlideShow(!isSlideShow)}>
        Toggle Slideshow {isSlideShow ? "Off" : "On"}
      </button>

      <section className={`carousel ${isSlideShow ? "slideshow" : ""}`}>
        <div
          tabIndex={0}
          className={`carousel-scroll-container ${
            !!navigateToNextItem ? "with-js" : ""
          }`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Products"
          ref={scrollContainerRef}
          // OR
          // aria-describedby="carouselDescription"
        >
          <div className="carousel-items">
            {/* Generate an array of images to display using the unsplash api  */}
            {Array.from(Array(SLIDES_COUNT).keys()).map((key, index, arr) => {
              const imgURL = imageUrls[wraparound(index, arr.length)];
              return (
                <div
                  data-slide-number={index + 1}
                  key={key}
                  role="group"
                  aria-labelledby={`carousel-item-${index + 1}-heading`}
                  className="carousel-slide"
                  id={`carousel-item-${index + 1}`}
                  aria-roledescription="Slide"
                >
                  <figure className="carousel-item-wrapper">
                    <figcaption id={`carousel-item-${index + 1}-heading`}>
                      Product {index + 1} Title
                    </figcaption>
                    <picture>
                      {/* Largest Size */}
                      <source
                        srcSet={`
                       https://source.unsplash.com/${imgURL}/1920x1080 1x
                      `}
                        media="(min-width: 75em)"
                      />
                      {/* Medium Size */}
                      <source
                        srcSet={`
                        https://source.unsplash.com/${imgURL}/1024x576 1x,
                        https://source.unsplash.com/${imgURL}/1920x1080 2x
                      `}
                        media="(min-width: 40em)"
                      />
                      <img
                        src={`https://source.unsplash.com/${imgURL}/400x225`}
                        alt={`Description of Slide ${index + 1}`}
                        srcSet={`
                  https://source.unsplash.com/${imgURL}/400x225 1x, 
                  https://source.unsplash.com/${imgURL}/1024x576 2x,
                  https://source.unsplash.com/${imgURL}/1920x1080 3x
                  `}
                        loading="lazy"
                        decoding="async"
                        width={1920}
                        height={1080}
                      />
                    </picture>
                  </figure>
                </div>
              );
            })}
          </div>
        </div>
        <div
          role="group"
          className="carousel-controls"
          aria-label="Carousel controls"
        >
          <div>
            <button
              aria-disabled={edges.start}
              className="carousel-control"
              aria-label="Previous"
              data-direction="start"
              onClick={(e) => {
                navigateToNextItem("start");
              }}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <div>
            <button
              aria-disabled={edges.end}
              className="carousel-control"
              aria-label="Next"
              data-direction="end"
              onClick={(e) => {
                navigateToNextItem("end");
              }}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        {/* <p id="carouselDescription">
          This carousel showcases featured content.
        </p> */}
      </section>

      <section id="next-section">Next section</section>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { Product as ProductType } from '../types';
import { useCarousel } from '../useCarousel';
import Product from './Product';

type Props = { products: ProductType[] };

const Carousel = (props: Props) => {
  const {
    focalSlideIndex,
    changeSlide,
    scrollContainerRef,
    slideRefs,
    isAtEnd,
    isAtStart,
  } = useCarousel({
    slidesCount: props.products.length,
    focalPointOffset: 0.25,
    skipAheadThreshold: 0.7,
    initialIndex: 0,
  });
  const isJS = !!changeSlide;

  // remove no-js class on load
  useEffect(() => {
    if (isJS) {
      document.documentElement.classList.remove('no-js');
      document.documentElement.classList.add('js');
    }
  }, [isJS]);
  return (
    <>
      <section className={`carousel relative w-full mb-12 max-w-7xl mx-auto`}>
        <div
          tabIndex={0}
          //  Add event listeners for keyboard navigation
          onKeyUp={(e) => {
            if (e.key === 'ArrowLeft') {
              changeSlide('start');
              e.preventDefault();
            }
            if (e.key === 'ArrowRight') {
              changeSlide('end');
              e.preventDefault();
            }
          }}
          className={`carousel-scroll-container overflow-x-auto scroll-snap-type-x-proximity scroll-smooth ${
            !!changeSlide ? 'snap-none' : 'snap-x snap-proximity'
          }

      `}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Products"
          ref={scrollContainerRef}
        >
          <div className="carousel-items flex gap-8">
            {props.products.map((product, index, arr) => {
              return (
                <div
                  ref={(el) => {
                    slideRefs.current[index] = el as HTMLDivElement;
                  }}
                  data-slide-number={index + 1}
                  key={product._id}
                  role="group"
                  aria-labelledby={`carousel-item-${index + 1}-heading`}
                  className={`carousel-slide relative w-96 flex-shrink-0 scroll-snap-align-center first-of-type:scroll-snap-align-start last-of-type:scroll-snap-align-end ${
                    focalSlideIndex === index ? 'focal-image ' : ''
                  }`}
                  id={`carousel-item-${index + 1}`}
                  aria-roledescription="Slide"
                  tabIndex={-1}
                >
                  <figure className="carousel-item-wrapper relative h-full">
                    <figcaption
                      id={`carousel-item-${index + 1}-heading`}
                      className="sr-only"
                    >
                      {product.displayTitle ||
                        `Slide ${index + 1} of ${arr.length}`}
                    </figcaption>
                    <Product
                      product={product}
                      eagerImageLoad={focalSlideIndex === index}
                    />
                    {/* {['image', 'product'].includes(slide.type) ? (
                      <SlideImage
                        imgURL={slide.src}
                        altText={slide.title}
                        index={index}
                      />
                    ) : slide.type === 'video' ? (
                      <SlideVideo
                        videoURL={slide.src}
                        fileType={slide.fileType || ''}
                      />
                    ) : slide.type === 'interactive' ? (
                      <InterActiveSlideWithButtons
                        title={slide.title}
                        isToggled={toggleSlideButton}
                        fn={() => {
                          setToggleSlideButton(!toggleSlideButton);
                        }}
                      />
                    ) : null} */}
                  </figure>
                </div>
              );
            })}
          </div>
        </div>
        <div
          role="group"
          className={`carousel-controls ${
            isJS ? 'block' : 'hidden'
          } cursor-pointer absolute -bottom-16  w-full mx-auto flex justify-center p-4 gap-4`}
          aria-label="Carousel controls"
        >
          <button
            aria-disabled={isAtStart}
            tabIndex={isAtStart ? -1 : 0}
            className={`carousel-control bg-black text-white rounded-sm p-2  ${
              isAtStart ? 'opacity-50 cursor-not-allowed' : ''
            } `}
            aria-label="Previous"
            data-direction="start"
            onClick={(e) => {
              changeSlide('start');
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
              Previous <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            aria-disabled={isAtEnd}
            tabIndex={isAtEnd ? -1 : 0}
            className={`carousel-control  bg-black text-white rounded-sm p-2 ${
              isAtEnd ? 'opacity-50 cursor-not-allowed' : ''
            } `}
            aria-label="Next"
            data-direction="end"
            onClick={(e) => {
              changeSlide('end');
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
              Next <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      <section
        id="next-section"
        className="bg-slate-200 h-screen w-full text-center mt-12 flex flex-col justify-center items-center"
      >
        <h2 className="text-3xl mb-4">Next Section</h2>
      </section>
    </>
  );
};

export default Carousel;

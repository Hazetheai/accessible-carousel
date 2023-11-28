'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Product as ProductType } from '../../types';
import { useCarousel } from '../useCarousel';
import Product from './Product';
type Props = { products: ProductType[] };

const initialIndex = 0;

const Carousel = (props: Props) => {
  const {
    focalSlideIndex,
    changeSlide,
    scrollToIndex,
    scrollContainerRef,
    slideRefs,
    isAtEnd,
    isAtStart,
  } = useCarousel({
    slidesCount: props.products.length,
    focalPointOffset: 0.15,
    skipAheadThreshold: 0.7,
    initialIndex,
  });
  const isJS = !!changeSlide;

  const leftPaddingOffset = 'pl-10 xl:pl-0';

  // remove no-js class on load
  useEffect(() => {
    if (isJS) {
      document.documentElement.classList.remove('no-js');
      document.documentElement.classList.add('js');
    }
  }, [isJS]);
  return (
    <>
      <section
        className={`carousel relative w-full mb-12 max-w-7xl -ml-2 xl:mx-auto`}
      >
        <div
          className={classNames(
            'sm:block absolute top-0 left-0 w-4 md:w-8 h-full z-20 bg-gradient-to-r from-white transition-opacity ease-in-out duration-300',
            isAtStart ? 'opacity-0' : 'opacity-100'
          )}
        ></div>
        <div
          className={classNames(
            'sm:block absolute top-0 right-0 w-4 md:w-8 h-full z-20 bg-gradient-to-l from-white transition-opacity ease-in-out duration-300',
            isAtEnd ? 'opacity-0' : 'opacity-100'
          )}
        ></div>
        <div
          className={classNames(
            'flex justify-between items-baseline relative z-30 pr-2 lg:pr-10',
            leftPaddingOffset
          )}
        >
          <h2 className="text-3xl mb-6">Title for carousel of products</h2>
          <Link aria-label="View All" href={'#0'}>
            View All
          </Link>
        </div>
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
          className={classNames(
            `carousel-scroll-container overflow-x-auto scroll-snap-type-x-proximity scroll-smooth`,
            !!changeSlide ? 'snap-none' : 'snap-x snap-proximity',
            leftPaddingOffset
          )}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Products"
          ref={scrollContainerRef}
        >
          <div className="carousel-items flex gap-4 lg:gap-8 mb-4">
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
                  className={`carousel-slide relative w-72 lg:w-96 max-w-screen flex-shrink-0 scroll-snap-align-center first-of-type:scroll-snap-align-start last-of-type:scroll-snap-align-end ${
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
                      {product.title || `Slide ${index + 1} of ${arr.length}`}
                    </figcaption>
                    <Product
                      product={product}
                      eagerImageLoad={index <= initialIndex + 2}
                    />
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
          } cursor-pointer absolute -bottom-20  w-full mx-auto flex justify-center lg:justify-end p-4 gap-4 pr-2 lg:pr-10`}
          aria-label="Carousel controls"
        >
          <button
            aria-disabled={isAtStart}
            disabled={isAtStart}
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
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
              />
            </svg>
          </button>

          <button
            aria-disabled={isAtEnd}
            disabled={isAtEnd}
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
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
              />
            </svg>
          </button>
        </div>
        <div
          className={classNames(
            'hidden lg:flex absolute -bottom-20 pl-0 p-4',
            leftPaddingOffset
          )}
        >
          <div className="flex gap-[2px]">
            {props.products.map((product, index) => {
              return (
                <button
                  key={product._id}
                  className={`carousel-bullet w-[12px] h-[3px] rounded-none transition-colors duration-300 ${
                    focalSlideIndex === index ||
                    focalSlideIndex === index - 1 ||
                    focalSlideIndex === index + 1
                      ? 'bg-black'
                      : 'bg-[#D9D9D9]'
                  }`}
                  title={product.title || `Slide ${index + 1}`}
                  aria-label={`Slide ${index + 1}`}
                  aria-current={focalSlideIndex === index ? 'true' : 'false'}
                  onClick={() => {
                    scrollToIndex(index);
                  }}
                ></button>
              );
            })}
          </div>
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

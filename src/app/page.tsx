'use client';
import { useEffect, useRef, useState } from 'react';
import _slidesData from './slides-data.json';
import { useCarousel } from './useCarousel';
import './globals.css';
import { InterActiveSlideWithButtons, SlideImage, SlideVideo } from './slides';

const slidesData = _slidesData.filter((slide) => slide.type !== 'video');

export default function Home() {
  const [toggleSlideButton, setToggleSlideButton] = useState(false);
  const [toggleOutsideButton, setToggleOutsideButton] = useState(false);

  const { focalSlideIndex, changeSlide, scrollContainerRef, slideRefs } =
    useCarousel({
      slidesCount: slidesData.length,
      focalPointOffset: 0.05,
      skipAheadThreshold: 0.9,
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
    <main>
      <a href="#next-section" className="skip-link">
        Skip to next section
      </a>

      <section className={`carousel relative w-full`}>
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
            {slidesData.map((slide, index, arr) => {
              return (
                <div
                  ref={(el) => {
                    slideRefs.current[index] = el as HTMLDivElement;
                  }}
                  data-slide-number={index + 1}
                  key={slide._id}
                  role="group"
                  aria-labelledby={`carousel-item-${index + 1}-heading`}
                  className={`carousel-slide relative h-80 flex-shrink-0 scroll-snap-align-center first-of-type:scroll-snap-align-start last-of-type:scroll-snap-align-end ${
                    focalSlideIndex === index ? 'focal-image' : ''
                  } ${slide.type}-slide `}
                  id={`carousel-item-${index + 1}`}
                  aria-roledescription="Slide"
                  tabIndex={-1}
                >
                  <figure className="carousel-item-wrapper relative h-full">
                    <figcaption
                      id={`carousel-item-${index + 1}-heading`}
                      className="text-white absolute bottom-0 left-0 w-full p-1 text-center bg-black bg-gradient-to-br  text-sm"
                    >
                      {slide.title || `Slide ${index + 1} of ${arr.length}`}
                    </figcaption>
                    {['image', 'product'].includes(slide.type) ? (
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
                    ) : null}
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
          } cursor-pointer absolute -bottom-1/6 left-1/2 w-12 mx-auto flex p-4 gap-4`}
          aria-label="Carousel controls"
        >
          <button
            aria-disabled={focalSlideIndex === 0}
            tabIndex={focalSlideIndex === 0 ? -1 : 0}
            className={`carousel-control bg-gray-400  ${
              focalSlideIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
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
            aria-disabled={focalSlideIndex === slidesData.length - 1}
            tabIndex={focalSlideIndex === slidesData.length - 1 ? -1 : 0}
            className={`carousel-control  bg-gray-400 ${
              focalSlideIndex === slidesData.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : ''
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

      <section id="next-section">
        Next section
        <button onClick={() => setToggleOutsideButton(!toggleOutsideButton)}>
          Toggle Outside Button {toggleOutsideButton ? 'Off' : 'On'}
        </button>
      </section>
    </main>
  );
}

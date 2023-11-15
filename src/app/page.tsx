"use client";
import { useEffect, useRef, useState } from "react";
import "./carousel.scss";
import _slidesData from "./slides-data.json";
import { useCarouselNew } from "./useCarouselNew";

const slidesData = _slidesData.filter((slide) => slide.type !== "video");

const findFirstFocusableElement = (container: Element | undefined) => {
  return container
    ? Array.from(container.getElementsByTagName("*")).find(isFocusable)
    : null;
};

const isFocusable = (element: Element) => {
  const focusableElements = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
    "video",
    "[contenteditable]",
  ];
  return focusableElements.some((selector) => element.matches(selector));
};

export default function Home() {
  //  Used for illustrative purposes
  const [focalPointOffset, setfocalPointOffset] = useState(0.05);
  const [skipAheadThreshold, setSkipAheadThreshold] = useState(0.7);
  const [toggleOverlays, setToggleOverlays] = useState(false);
  const [toggleSlideButton, setToggleSlideButton] = useState(false);
  //
  const [isTouched, setIsTouched] = useState(false);

  const { focalSlideIndex, changeSlide, scrollContainerRef } = useCarouselNew({
    slidesCount: slidesData.length,
    focalPointOffset,
    skipAheadThreshold,
    initialIndex: 0,
  });

  const slideRefs = useRef<HTMLDivElement[]>([]);

  // remove no-js class on load
  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");
  }, []);

  useEffect(() => {
    const firstFocusableInput = findFirstFocusableElement(
      slideRefs?.current[focalSlideIndex]
    );
    if (
      focalSlideIndex !== null &&
      slideRefs.current[focalSlideIndex] &&
      firstFocusableInput
    ) {
      (firstFocusableInput as HTMLElement).focus();
    } else {
      isTouched && scrollContainerRef.current?.focus();
    }
  }, [focalSlideIndex, scrollContainerRef, isTouched]);

  // Used for illustrative purposes
  const widthOfPreviousSlide =
    scrollContainerRef.current?.querySelectorAll(".carousel-slide")[
      focalSlideIndex - 1
    ]?.clientWidth || 0;

  const widthOfNextSlide =
    scrollContainerRef.current?.querySelectorAll(".carousel-slide")[
      focalSlideIndex + 1
    ]?.clientWidth || 0;

  return (
    <main>
      <a href="#next-section" className="skip-link">
        Skip to next section
      </a>
      <button onClick={() => setToggleOverlays(!toggleOverlays)}>
        Toggle Overlays {toggleOverlays ? "Off" : "On"}
      </button>
      {toggleOverlays && (
        <div>
          <p>Current Focal Image Index {focalSlideIndex}</p>
          <div>
            <label htmlFor="focal-point-offset">Focal Point Offset:</label>
            <input
              type="range"
              id="focal-point-offset"
              name="focal-point-offset"
              min="0"
              max=".3"
              step="0.01"
              value={focalPointOffset}
              onChange={(e) => setfocalPointOffset(parseFloat(e.target.value))}
            />{" "}
          </div>
          <div>
            <label htmlFor="focal-point-skipAheadThreshold">
              Skip Ahead Threshold:
            </label>
            <input
              type="range"
              id="focal-point-skipAheadThreshold"
              name="focal-point-skipAheadThreshold"
              min="0.01"
              max="0.99"
              step="0.01"
              value={skipAheadThreshold}
              onChange={(e) =>
                setSkipAheadThreshold(parseFloat(e.target.value))
              }
            />{" "}
          </div>
        </div>
      )}
      <section
        className={`carousel ${toggleOverlays ? "overlays-active" : ""} `}
      >
        <div
          style={{
            // @ts-ignore - used for illustrative purposes
            "--center-point-offset": `${(1 + focalPointOffset * 2).toFixed(2)}`,
            "--skip-ahead-threshold": `${skipAheadThreshold.toFixed(2)}`,
            "--width-of-previous-slide": `${widthOfPreviousSlide}px`,
            "--width-of-next-slide": `${widthOfNextSlide}px`,
          }}
          tabIndex={0}
          onFocus={() => {
            setIsTouched(true);
          }}
          //  Add event listeners for keyboard navigation
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft") {
              changeSlide("start");
              e.preventDefault();
            }
            if (e.key === "ArrowRight") {
              changeSlide("end");
              e.preventDefault();
            }
          }}
          className={`carousel-scroll-container ${
            !!changeSlide ? "with-js" : ""
          }`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Products"
          ref={scrollContainerRef}
        >
          <div className="center-point focal-point-start"></div>
          <div className="center-point focal-point-end"></div>
          <div className="carousel-items">
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
                  className={`carousel-slide ${
                    focalSlideIndex === index ? "focal-image" : ""
                  } ${slide.type}-slide `}
                  id={`carousel-item-${index + 1}`}
                  aria-roledescription="Slide"
                  tabIndex={-1}
                >
                  <figure className="carousel-item-wrapper">
                    <figcaption id={`carousel-item-${index + 1}-heading`}>
                      {slide.title || `Slide ${index + 1} of ${arr.length}`}
                    </figcaption>
                    {["image", "product"].includes(slide.type) ? (
                      <SlideImage
                        imgURL={slide.src}
                        altText={slide.title}
                        isfocalSlide={focalSlideIndex === index}
                        index={index}
                      />
                    ) : slide.type === "video" ? (
                      <SlideVideo
                        videoURL={slide.src}
                        fileType={slide.fileType || ""}
                      />
                    ) : slide.type === "interactive" ? (
                      <InterActiveSlideWithButtons
                        title={slide.title}
                        isToggled={toggleSlideButton}
                        isfocalSlide={focalSlideIndex === index}
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
          className="carousel-controls"
          aria-label="Carousel controls"
        >
          <div>
            <button
              aria-disabled={focalSlideIndex === 0}
              tabIndex={focalSlideIndex === 0 ? -1 : 0}
              className="carousel-control"
              aria-label="Previous"
              data-direction="start"
              onClick={(e) => {
                changeSlide("start");
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
              aria-disabled={focalSlideIndex === slidesData.length - 1}
              tabIndex={focalSlideIndex === slidesData.length - 1 ? -1 : 0}
              className="carousel-control"
              aria-label="Next"
              data-direction="end"
              onClick={(e) => {
                changeSlide("end");
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
      </section>

      <section id="next-section">Next section</section>
    </main>
  );
}

const SlideImage = ({
  imgURL,
  altText,
  index,
}: {
  imgURL: string;
  altText: string;
  isfocalSlide: boolean;
  index: number;
}) => {
  return (
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
        alt={altText || `Description of Slide ${index + 1}`}
        srcSet={`
https://source.unsplash.com/${imgURL}/400x225 1x, 
https://source.unsplash.com/${imgURL}/1024x576 2x,
https://source.unsplash.com/${imgURL}/1920x1080 3x
`}
        // loading="lazy"
        decoding="async"
        width={1920}
        height={1080}
      />
    </picture>
  );
};

const SlideVideo = ({
  videoURL,
  fileType,
}: {
  videoURL: string;
  fileType: string;
}) => {
  return (
    <div className="video-container">
      <video controls aria-label="Video 1" poster="video-poster.jpg">
        {/* Add your video source and other attributes here */}
        {fileType === "webm" && <source src={videoURL} type="video/webm" />}
        {fileType === "mp4" && <source src={videoURL} type="video/mp4" />}
        {fileType === "ogg" && <source src={videoURL} type="video/ogg" />}

        {/* Closed captions or subtitles for spoken content */}
        <track
          label="English"
          kind="subtitles"
          srcLang="en"
          src="vtt/subtitles-en.vtt"
          default
        />
        <track
          label="Francais"
          kind="subtitles"
          srcLang="fr"
          src="vtt/subtitles-fr.vtt"
        />
        <p>
          Your browser does not support the video tag.
          <br />
          <a href="https://tinloof.com/blog">Click here</a> to view source.
        </p>
      </video>
    </div>
  );
};

const InterActiveSlideWithButtons = ({
  fn,
  isfocalSlide,
  title,
  isToggled,
}: {
  fn: () => void;
  isfocalSlide: boolean;
  title: string;
  isToggled: boolean;
}) => {
  return (
    <div>
      <h3>{title}</h3>
      {/* Using a negative tabindex ensures that these elements 
      are not focusable until the user interacts with the carousel.  */}
      <button tabIndex={isfocalSlide ? 0 : -1} onClick={fn}>
        Click Me
      </button>
      <div className="interactive-slide__output">
        {isToggled ? "ON" : "OFF"}
      </div>
    </div>
  );
};

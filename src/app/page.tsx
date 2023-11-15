"use client";
import { useEffect, useRef, useState } from "react";
import "./carousel.scss";
import styles from "./page.module.css";
import _slidesData from "./slides-data.json";
import { useCarouselNew } from "./useCarouselNew";

const slidesData = _slidesData.filter((slide) => slide.type !== "video");

export default function Home() {
  // remove no-js class on load
  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");
  }, []);
  const [isSlideShow, setIsSlideShow] = useState(false);
  const [focalPointOffset, setfocalPointOffset] = useState(0.05);
  const [skipAheadThreshold, setSkipAheadThreshold] = useState(0.7);
  const [toggleOverlays, setToggleOverlays] = useState(true);
  const [toggleSlideButton, setToggleSlideButton] = useState(false);

  const { focalImageIndex, navigateToNextItem, scrollContainerRef } =
    useCarouselNew({
      slidesCount: slidesData.length,
      focalPointOffset,
      skipAheadThreshold,
      initialIndex: 0,
    });

  // console.log("carouselPosition", carouselPosition);
  const widthOfPreviousSlide =
    scrollContainerRef.current?.querySelectorAll(".carousel-slide")[
      focalImageIndex - 1
    ]?.clientWidth || 0;

  const widthOfNextSlide =
    scrollContainerRef.current?.querySelectorAll(".carousel-slide")[
      focalImageIndex + 1
    ]?.clientWidth || 0;

  return (
    <main className={styles.main}>
      <a href="#next-section" className="skip-link">
        Skip to next section
      </a>
      {/* <button onClick={() => setIsSlideShow(!isSlideShow)}>
        Toggle Slideshow {isSlideShow ? "Off" : "On"}
      </button> */}
      <button onClick={() => setToggleOverlays(!toggleOverlays)}>
        Toggle Overlays {toggleOverlays ? "Off" : "On"}
      </button>
      {toggleOverlays && (
        <div>
          <p>Current Focal Image Index {focalImageIndex}</p>
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
        className={`carousel ${isSlideShow ? "slideshow" : ""} ${
          toggleOverlays ? "overlays-active" : ""
        } `}
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
          //  Add event listeners for keyboard navigation
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft") {
              navigateToNextItem("start");
              // e.stopPropagation();
              e.preventDefault();
            }
            if (e.key === "ArrowRight") {
              navigateToNextItem("end");
              // e.stopPropagation();
              e.preventDefault();
              console.log(`navigateToNextItem("end")`);
            }
          }}
          className={`carousel-scroll-container ${
            !!navigateToNextItem ? "with-js" : ""
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
                  data-slide-number={index + 1}
                  key={slide._id}
                  role="group"
                  aria-labelledby={`carousel-item-${index + 1}-heading`}
                  className={`carousel-slide ${
                    focalImageIndex === index ? "focal-image" : ""
                  } ${slide.type}-slide `}
                  id={`carousel-item-${index + 1}`}
                  aria-roledescription="Slide"
                  onFocus={() => {
                    console.log("focused", slide.title);
                  }}
                >
                  <figure className="carousel-item-wrapper">
                    <figcaption id={`carousel-item-${index + 1}-heading`}>
                      {slide.title}
                    </figcaption>
                    {["image", "product"].includes(slide.type) ? (
                      <SlideImage
                        imgURL={slide.src}
                        altText={slide.title}
                        isFocalImage={focalImageIndex === index}
                        index={index}
                      />
                    ) : slide.type === "video" ? (
                      <SlideVideo
                        title={slide.title}
                        videoURL={slide.src}
                        altText={slide.title}
                        isFocalImage={focalImageIndex === index}
                        index={index}
                        fileType={slide.fileType || ""}
                      />
                    ) : slide.type === "interactive" ? (
                      <InterActiveSlideWithButtons
                        title={slide.title}
                        isToggled={toggleSlideButton}
                        index={index}
                        isFocalImage={focalImageIndex === index}
                        fn={() => {
                          setToggleSlideButton(!toggleSlideButton);
                        }}
                      />
                    ) : (
                      "BEANS"
                    )}
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
              aria-disabled={focalImageIndex === 0}
              tabIndex={focalImageIndex === 0 ? -1 : 0}
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
              aria-disabled={focalImageIndex === slidesData.length - 1}
              tabIndex={focalImageIndex === slidesData.length - 1 ? -1 : 0}
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
      </section>

      <section id="next-section">Next section</section>
    </main>
  );
}

const SlideImage = ({
  imgURL,
  altText,
  isFocalImage,
  index,
}: {
  imgURL: string;
  altText: string;
  isFocalImage: boolean;
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
  altText,
  isFocalImage,
  index,
  fileType,
  title,
}: {
  videoURL: string;
  altText: string;
  isFocalImage: boolean;
  index: number;
  fileType: string;
  title: string;
}) => {
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocalImage && slideRef.current) {
      slideRef.current.focus();
    }
  }, [isFocalImage]);

  return (
    <div className="video-container">
      <video
        controls
        aria-label="Video 1"
        tabIndex={isFocalImage ? 0 : -1}
        poster="video-poster.jpg"
      >
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
  index,
  isFocalImage,
  title,
  isToggled,
}: {
  fn: () => void;
  index: number;
  isFocalImage: boolean;
  title: string;
  isToggled: boolean;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocalImage && buttonRef.current) {
      buttonRef.current.focus();
    } else {
      buttonRef.current?.blur();
    }
  }, [isFocalImage]);

  return (
    <div className={``}>
      <h3>{title}</h3>

      {/* Using a negative tabindex ensures that these elements 
      are not focusable until the user interacts with the carousel.  */}
      <button ref={buttonRef} tabIndex={isFocalImage ? 0 : -1} onClick={fn}>
        Click Me
      </button>
      <div className="interactive-slide__output">
        {isToggled ? "ON" : "OFF"}
      </div>
    </div>
  );
};

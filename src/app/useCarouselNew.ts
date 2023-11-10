import { useState, useRef, useEffect } from "react";

type ThrottleFunction = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) => (...args: T) => void;

const throttle: ThrottleFunction = (fn, delay) => {
  let lastCallTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      fn(...args);
      lastCallTime = now;
    }
  };
};

/**
 * Returns `true` if the given element is in a horizontal RTL writing mode.
 * @param {HTMLElement} element
 */
const isRtl = (element: HTMLElement): boolean =>
  window.getComputedStyle(element).direction === "rtl";

/**
 * Returns the distance from the starting edge of the viewport to the given focal point on the element.
 * @param {HTMLElement} element
 * @param {'start'|'center'|'end'} [focalPoint]
 */
const getDistanceToFocalPoint = (
  element: HTMLElement,
  focalPoint: "start" | "center" | "end" = "center"
): number => {
  const isHorizontalRtl = isRtl(element);
  const documentWidth = document.documentElement.clientWidth;
  const rect = element.getBoundingClientRect();
  switch (focalPoint) {
    case "start":
      return isHorizontalRtl ? documentWidth - rect.right : rect.left;
    case "end":
      return isHorizontalRtl ? documentWidth - rect.left : rect.right;
    case "center":
    default: {
      const centerFromLeft = rect.left + rect.width / 2;
      return isHorizontalRtl ? documentWidth - centerFromLeft : centerFromLeft;
    }
  }
};

const useCarouselNew = ({
  slidesCount,
  initialIndex = 0,
}: {
  slidesCount: number;
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [focalPointImage, setFocalPointImage] = useState({
    index: 0,
    isCloserToStart: initialIndex === 0,
    isCloserToEnd: false,
  });
  useEffect(() => {
    const handleCarouselScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      // scrollLeft is negative in a right-to-left writing mode
      const scrollLeft = Math.abs(scrollContainer.scrollLeft);

      // off-by-one correction for Chrome, where clientWidth is sometimes rounded down
      const width = scrollContainer.clientWidth + 1;
      const isAtStart = Math.floor(scrollLeft) === 0;
      const isAtEnd =
        Math.ceil(width + scrollLeft) >= scrollContainer.scrollWidth;

      // find the index of the item whose focal point is closest to the center of the scroll container
      const mediaItems = Array.from(
        scrollContainer.querySelectorAll(".carousel-slide")
      );
      const center = scrollContainer.clientWidth / 2;
      const focalPoints = mediaItems.map((mediaItem) =>
        getDistanceToFocalPoint(mediaItem, "center")
      );
      const closestFocalPoint = focalPoints.reduce((prev, curr) =>
        Math.abs(curr - center) < Math.abs(prev - center) ? curr : prev
      );
      const closestFocalPointIndex = focalPoints.indexOf(closestFocalPoint);
      setCurrentIndex(
        isAtEnd ? slidesCount - 1 : isAtStart ? 0 : closestFocalPointIndex
      );

      // detect whether item at focal point is closer to the start or end of the scroll container
      const focalPoint = focalPoints[closestFocalPointIndex];
      const isCloserToEnd = focalPoint > width / 2;
      const isCloserToStart = focalPoint < width / 2;
      // console.log("isCloserToStart", isCloserToStart);
      // console.log("isCloserToEnd", isCloserToEnd);
      setFocalPointImage({
        index: closestFocalPointIndex,
        isCloserToStart,
        isCloserToEnd,
      });
      setEdges({ start: isAtStart, end: isAtEnd });

      // TODO: set aria-disabled attribute on navigation controls
    };

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener(
      "scroll",
      throttle(handleCarouselScroll, 100)
    );
    scrollContainer.addEventListener("scrollend", handleCarouselScroll);
    handleCarouselScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleCarouselScroll);
      scrollContainer.removeEventListener("scrollend", handleCarouselScroll);
    };
  }, []);

  const navigateToNextItem = throttle((direction: "start" | "end") => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let mediaItems = Array.from(
      scrollContainer.querySelectorAll(".carousel-slide")
    );
    mediaItems = direction === "start" ? mediaItems.reverse() : mediaItems;

    // Basic idea: Find the first item whose focal point is past
    // the scroll container's center in the direction of travel.
    const scrollContainerCenter = getDistanceToFocalPoint(
      scrollContainer,
      "center"
    );
    let targetFocalPoint;

    for (const mediaItem of mediaItems) {
      let focalPoint = window.getComputedStyle(mediaItem).scrollSnapAlign;
      if (focalPoint === "none") {
        focalPoint = "center";
      }
      // @ts-ignore
      const distanceToItem = getDistanceToFocalPoint(mediaItem, focalPoint);
      if (
        (direction === "start" && distanceToItem + 1 < scrollContainerCenter) ||
        (direction === "end" && distanceToItem - scrollContainerCenter > 1)
      ) {
        targetFocalPoint = distanceToItem;
        break;
      }
    }

    // This should never happen, but it doesn't hurt to check
    if (typeof targetFocalPoint === "undefined") return;
    // RTL flips the direction
    // console.log("targetFocalPoint", targetFocalPoint);
    const sign = isRtl(scrollContainer) ? -1 : 1;
    const scrollAmount = sign * (targetFocalPoint - scrollContainerCenter);
    scrollContainer.scrollBy({ left: scrollAmount });
    const newMediaItems = Array.from(
      scrollContainer.querySelectorAll(".carousel-slide")
    );
    const newTargetIndex = newMediaItems.findIndex(
      (mediaItem) =>
        Math.abs(
          getDistanceToFocalPoint(mediaItem, "center") - targetFocalPoint
        ) < 1
    );
    if (newTargetIndex !== -1) {
      setCurrentIndex(newTargetIndex);
    }
  }, 200);
  console.log("currentIndex", currentIndex);
  return { scrollContainerRef, currentIndex, navigateToNextItem, edges };
};

export default useCarouselNew;

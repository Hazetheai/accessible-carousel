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

function calculateVisiblePercentage(
  element: HTMLElement | null,
  scrollContainer: HTMLElement
): number {
  if (!element) return 0;
  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();

  const visibleWidth =
    Math.min(elementRect.right, containerRect.right) -
    Math.max(elementRect.left, containerRect.left);
  const visibleHeight =
    Math.min(elementRect.bottom, containerRect.bottom) -
    Math.max(elementRect.top, containerRect.top);

  const visibleArea = visibleWidth * visibleHeight;
  const elementArea = elementRect.width * elementRect.height;

  return visibleArea / elementArea;
}

function detectScrollDirection(
  scrollLeft: number = 0,
  prevScrollLeft: React.MutableRefObject<number>,
  threshold = 0.01
) {
  const scrollDelta = scrollLeft - prevScrollLeft.current;
  const isScrollingTowardsEnd = scrollDelta > 0;
  const isScrollingTowardsStart = scrollDelta < 0;
  prevScrollLeft.current = isScrollingTowardsEnd
    ? scrollLeft - threshold
    : scrollLeft + threshold;

  return { isScrollingTowardsEnd, isScrollingTowardsStart };
}

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
  scrollContainer: HTMLElement,
  element: HTMLElement,
  focalPoint: "start" | "center" | "end" = "center"
): number => {
  //  Calculate the distance from the starting edge of the viewport to edge of the scrollContainer to account for padding, margins other elements etc.
  const scrollContainerRect = scrollContainer.getBoundingClientRect();
  const offsetLeft = scrollContainerRect.left;
  const offsetRight = scrollContainerRect.right;

  const isHorizontalRtl = isRtl(element);
  const scrollContainerWidth = scrollContainer.clientWidth;
  const rect = element.getBoundingClientRect();
  switch (focalPoint) {
    case "start":
      return isHorizontalRtl
        ? scrollContainerWidth - rect.right - offsetRight
        : rect.left - offsetLeft;
    case "end":
      return isHorizontalRtl
        ? scrollContainerWidth - rect.left - offsetRight
        : rect.right - offsetLeft;
    case "center":
    default: {
      const centerFromLeft = rect.left + rect.width / 2;
      return isHorizontalRtl
        ? scrollContainerWidth - centerFromLeft - offsetRight
        : centerFromLeft - offsetLeft;
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
  const [carouselPosition, setCarouselPosition] = useState({
    start: true,
    end: false,
    isScrollingTowardsEnd: false,
    isScrollingTowardsStart: false,
  });
  const [focalPointImage, setFocalPointImage] = useState({
    index: 0,
    isCloserToStart: initialIndex === 0,
    isCloserToEnd: false,
  });
  const prevScrollLeft = useRef(0);
  useEffect(() => {
    const handleCarouselScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      // scrollLeft is negative in a right-to-left writing mode
      const scrollLeft = Math.abs(scrollContainer.scrollLeft) || 0;

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
        getDistanceToFocalPoint(scrollContainer, mediaItem, "center")
      );
      // console.log("focalPoints", focalPoints);
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
      const { isScrollingTowardsEnd, isScrollingTowardsStart } =
        detectScrollDirection(scrollLeft, prevScrollLeft, 0.1);

      setCarouselPosition({
        start: isAtStart,
        end: isAtEnd,
        isScrollingTowardsEnd,
        isScrollingTowardsStart,
      });

      // TODO: set aria-disabled attribute on navigation controls
    };

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener(
      "scroll",
      throttle(handleCarouselScroll, 100)
    );
    scrollContainer.addEventListener("scrollend", handleCarouselScroll);
    scrollContainer.addEventListener("scrollend", handleCarouselScroll);
    handleCarouselScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleCarouselScroll);
      scrollContainer.removeEventListener("scrollend", handleCarouselScroll);
    };
  }, [slidesCount]);

  const navigateToNextItem = (direction: "start" | "end") => {
    const threshold = 0.8;
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
      scrollContainer,
      "center"
    );
    let targetFocalPoint;

    const nextItem = mediaItems[focalPointImage.index].nextElementSibling;
    const previousItem =
      mediaItems[focalPointImage.index].previousElementSibling;

    for (const mediaItem of mediaItems) {
      let focalPoint = window.getComputedStyle(mediaItem).scrollSnapAlign;
      if (focalPoint === "none") {
        focalPoint = "center";
      }

      const distanceToNextItem = nextItem
        ? getDistanceToFocalPoint(
            scrollContainer,
            nextItem as HTMLElement,
            focalPoint
          )
        : undefined;
      const distanceToPreviousItem = previousItem
        ? getDistanceToFocalPoint(
            scrollContainer,
            previousItem as HTMLElement,
            focalPoint
          )
        : undefined;
      // const indexOfItem = mediaItems.indexOf(mediaItem);
      const visiblePercentage =
        nextItem || previousItem
          ? calculateVisiblePercentage(
              direction === "end" ? nextItem : previousItem,
              scrollContainer
            )
          : 0;

      const shouldNavigateToNextItem =
        direction === "end" &&
        visiblePercentage > threshold &&
        !!distanceToNextItem;

      const shouldNavigateToPreviousItem =
        direction === "start" &&
        visiblePercentage > threshold &&
        !!distanceToPreviousItem;

      // console.log("shouldNavigateToNextItem", shouldNavigateToNextItem);
      // console.log("shouldNavigateToPreviousItem", shouldNavigateToPreviousItem);

      if (shouldNavigateToPreviousItem || shouldNavigateToNextItem) {
        targetFocalPoint =
          direction === "end" ? distanceToNextItem : distanceToPreviousItem;
        break;
      }

      const distanceToItem = getDistanceToFocalPoint(
        scrollContainer,
        mediaItem,
        focalPoint
      );

      if (
        shouldNavigateToNextItem ||
        shouldNavigateToPreviousItem ||
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
          getDistanceToFocalPoint(scrollContainer, mediaItem, "center") -
            targetFocalPoint
        ) < 1
    );
    if (newTargetIndex !== -1) {
      setCurrentIndex(newTargetIndex);
    }
  };

  // console.log("currentIndex", currentIndex);
  return {
    focalPointImage,
    scrollContainerRef,
    currentIndex,
    navigateToNextItem: throttle(navigateToNextItem, 200),
    carouselPosition,
  };
};

export { useCarouselNew };

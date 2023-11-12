import { useState, useRef, useEffect } from "react";

type ThrottleFunction = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) => (...args: T) => void;

const throttle: ThrottleFunction = (fn, delay) => {
  let lastCallTime = 0;
  let rafId: number | null = null;
  return (...args) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const now = performance.now();
      if (now - lastCallTime >= delay) {
        fn(...args);
        lastCallTime = now;
      }
      rafId = null;
    });
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

const isRtl = (element: HTMLElement): boolean =>
  window.getComputedStyle(element).direction === "rtl";

interface GetDistanceToFocalPointParams {
  scrollContainer: HTMLElement;
  element: HTMLElement;
  focalPoint?: "start" | "center" | "end";
  focalPointOffset?: number;
}

const getDistanceToFocalPoint = ({
  scrollContainer,
  element,
  focalPoint = "center",
  focalPointOffset = 0,
}: GetDistanceToFocalPointParams): number => {
  //  Calculate the distance from the starting edge of the viewport to edge of the scrollContainer to account for padding, margins other elements etc.
  const scrollContainerRect = scrollContainer.getBoundingClientRect();
  const offset = focalPointOffset * scrollContainer.clientWidth;
  const offsetLeft = offset + scrollContainerRect.left;
  const offsetRight = offset + scrollContainerRect.right;

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
  focalPointOffset = 0,
}: {
  slidesCount: number;
  initialIndex?: number;
  focalPointOffset?: number;
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
        getDistanceToFocalPoint({
          focalPointOffset,
          scrollContainer,
          element: mediaItem,
          focalPoint: "center",
        })
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
    };

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener(
      "scroll",
      throttle(handleCarouselScroll, 10)
    );
    scrollContainer.addEventListener("scrollend", handleCarouselScroll);
    handleCarouselScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleCarouselScroll);
      scrollContainer.removeEventListener("scrollend", handleCarouselScroll);
    };
  }, [slidesCount, focalPointOffset]);

  const navigateToNextItem = (direction: "start" | "end") => {
    const threshold = 0.8;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let mediaItems = Array.from(
      scrollContainer.querySelectorAll(".carousel-slide")
    );
    mediaItems = direction === "start" ? mediaItems.reverse() : mediaItems;

    // Only used when direction === "start" & moving to image above threshold
    const reversedMediaItems = mediaItems.slice().reverse();

    // Basic idea: Find the first item whose focal point is past
    // the scroll container's center in the direction of travel.
    const scrollContainerCenter = getDistanceToFocalPoint({
      focalPointOffset,
      scrollContainer,
      element: scrollContainer,
      focalPoint: "center",
    });
    let targetFocalPoint;

    const nextItem = mediaItems[focalPointImage.index].nextElementSibling;
    const previousItem =
      reversedMediaItems[focalPointImage.index].previousElementSibling;
    const isNotStartOrEnd =
      focalPointImage.index !== 0 && focalPointImage.index !== slidesCount - 1;

    for (const mediaItem of mediaItems) {
      let focalPoint = window.getComputedStyle(mediaItem).scrollSnapAlign;
      if (focalPoint === "none") {
        focalPoint = "center";
      }
      const isFocalImage =
        (direction === "start" ? reversedMediaItems : mediaItems).indexOf(
          mediaItem
        ) === focalPointImage.index;

      const distanceToNextItem = nextItem
        ? getDistanceToFocalPoint({
            focalPointOffset,
            scrollContainer,
            element: nextItem as HTMLElement,
            focalPoint,
          })
        : undefined;
      const distanceToPreviousItem = previousItem
        ? getDistanceToFocalPoint({
            focalPointOffset,
            scrollContainer,
            element: previousItem as HTMLElement,
            focalPoint,
          })
        : undefined;

      // if the focal image visible is > threshold,
      // and the direction of travel is towards the end,
      // then center the following image
      // if the focal image threshold is < threshold,
      // and the direction of travel is towards the end,
      // then center the focal image & vice versa

      if (isFocalImage && isNotStartOrEnd) {
        const visiblePercentage = calculateVisiblePercentage(
          mediaItem,
          scrollContainer
        );
        const isFocalPointAboveThreshold = visiblePercentage > threshold;

        if (
          direction === "end" &&
          distanceToNextItem &&
          distanceToNextItem > 0 &&
          isFocalPointAboveThreshold
        ) {
          targetFocalPoint = distanceToNextItem;

          break;
        }
        if (
          direction === "start" &&
          distanceToPreviousItem &&
          distanceToPreviousItem < 0 &&
          isFocalPointAboveThreshold
        ) {
          targetFocalPoint = distanceToPreviousItem;
          break;
        }
      }

      // Ususal case: find the first item whose focal point is past
      // the scroll container's center in the direction of travel.
      const distanceToItem = getDistanceToFocalPoint({
        focalPointOffset,
        scrollContainer,
        element: mediaItem,
        focalPoint,
      });

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

    const sign = isRtl(scrollContainer) ? -1 : 1;
    const scrollAmount = sign * (targetFocalPoint - scrollContainerCenter);
    scrollContainer.scrollBy({ left: scrollAmount });
    const newMediaItems = Array.from(
      scrollContainer.querySelectorAll(".carousel-slide")
    );
    const newTargetIndex = newMediaItems.findIndex(
      (mediaItem) =>
        Math.abs(
          getDistanceToFocalPoint({
            focalPointOffset,
            scrollContainer,
            element: mediaItem,
            focalPoint: "center",
          }) - targetFocalPoint
        ) < 1
    );
    if (newTargetIndex !== -1) {
      setCurrentIndex(newTargetIndex);
    }
  };

  return {
    focalPointImage,
    scrollContainerRef,
    currentIndex,
    navigateToNextItem: throttle(navigateToNextItem, 200),
    carouselPosition,
  };
};

export { useCarouselNew };

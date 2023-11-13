import { useState, useRef, useEffect, use, useCallback } from "react";

type ThrottleFunction = <T extends unknown[]>(
  fn: (...args: T) => void
) => (...args: T) => void;

const throttle: ThrottleFunction = (fn) => {
  let rafId: number | null = null;
  return (...args) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
};

function calculateVisiblePercentage(
  element: Element | null,
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

// function detectScrollDirection(
//   scrollLeft: number = 0,
//   prevScrollLeft: React.MutableRefObject<number>,
//   threshold = 0.01
// ) {
//   const scrollDelta = scrollLeft - prevScrollLeft.current;
//   const isScrollingTowardsEnd = scrollDelta > 0;
//   const isScrollingTowardsStart = scrollDelta < 0;
//   prevScrollLeft.current = isScrollingTowardsEnd
//     ? scrollLeft - threshold
//     : scrollLeft + threshold;

//   return { isScrollingTowardsEnd, isScrollingTowardsStart };
// }

const isRtl = (element: Element): boolean =>
  window.getComputedStyle(element).direction === "rtl";

interface GetDistanceToFocalPointParams {
  scrollContainer: HTMLElement;
  element: Element;
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
  skipAheadThreshold = 0.8,
}: {
  slidesCount: number;
  initialIndex?: number;
  focalPointOffset?: number;
  skipAheadThreshold?: number;
}) => {
  const [focalImageIndex, setFocalImageIndex] = useState(initialIndex);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // const prevScrollLeft = useRef(0);

  const handleCarouselScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // scrollLeft is negative in a right-to-left writing mode
    // const scrollLeft = Math.abs(scrollContainer.scrollLeft) || 0;
    // off-by-one correction for Chrome, where clientWidth is sometimes rounded down
    // const width = scrollContainer.clientWidth + 1;
    // const isAtStart = Math.floor(scrollLeft) === 0;
    // const isAtEnd =
    //   Math.ceil(width + scrollLeft) >= scrollContainer.scrollWidth;

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

    setFocalImageIndex(
      // isAtEnd ? slidesCount - 1 : isAtStart ? 0 : closestFocalPointIndex
      closestFocalPointIndex
    );
  }, [focalPointOffset]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    scrollContainer.addEventListener("scroll", throttle(handleCarouselScroll));
    scrollContainer.addEventListener("scrollend", handleCarouselScroll);
    handleCarouselScroll();

    return () => {
      scrollContainer.removeEventListener("scroll", handleCarouselScroll);
      scrollContainer.removeEventListener("scrollend", handleCarouselScroll);
    };
  }, [handleCarouselScroll]);

  const navigateToNextItem = (direction: "start" | "end") => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let mediaItems = Array.from(
      scrollContainer.querySelectorAll(".carousel-slide")
    );
    const scrollSnapProps = ["center", "start", "end"] as const;
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
    let targetFocalPoint: number | undefined;

    const nextItem = mediaItems[focalImageIndex].nextElementSibling;
    // Only used when direction === "start" & moving to image above threshold
    const previousItem =
      reversedMediaItems[focalImageIndex].previousElementSibling;
    const isNotStartOrEnd =
      focalImageIndex !== 0 && focalImageIndex !== slidesCount - 1;

    for (const mediaItem of mediaItems) {
      const focalPoint =
        scrollSnapProps.find(
          (el) => el === window.getComputedStyle(mediaItem).scrollSnapAlign
        ) || "center";

      const isFocalImage =
        (direction === "start" ? reversedMediaItems : mediaItems).indexOf(
          mediaItem
        ) === focalImageIndex;

      // Edge case: Focal image may be mostly visible, so move to the next image,
      // instead of centering the focal image, which can be frustrating and a bad UX

      if (isFocalImage && isNotStartOrEnd) {
        const visiblePercentage = calculateVisiblePercentage(
          mediaItem,
          scrollContainer
        );

        console.log("visiblePercentage", visiblePercentage);
        const isFocalPointAboveThreshold =
          visiblePercentage > skipAheadThreshold;

        const distanceToNextItem = nextItem
          ? getDistanceToFocalPoint({
              focalPointOffset,
              scrollContainer,
              element: nextItem,
              focalPoint,
            })
          : undefined;

        const distanceToPreviousItem = previousItem
          ? getDistanceToFocalPoint({
              focalPointOffset,
              scrollContainer,
              element: previousItem,
              focalPoint,
            })
          : undefined;

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

    if (typeof targetFocalPoint === "undefined") return;

    // RTL flips the direction
    const sign = isRtl(scrollContainer) ? -1 : 1;

    const scrollAmount = sign * (targetFocalPoint - scrollContainerCenter);
    scrollContainer.scrollBy({ left: scrollAmount });
  };

  return {
    scrollContainerRef,
    focalImageIndex,
    navigateToNextItem: throttle(navigateToNextItem),
  };
};

export { useCarouselNew };

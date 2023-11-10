import { useEffect, useRef, useState } from "react";

export function useCarousel({
  slidesCount,
  initialIndex = 0,
}: {
  slidesCount: number;
  initialIndex?: number;
}) {
  const slidesRef = useRef<HTMLDivElement | null>(null);
  const [curSlideIndex, setSlideIndex] = useState(initialIndex);
  const [skippedMount, setSkippedMount] = useState(false);

  // SCROLLING ON STATE CHANGE (when user clicks on arrow buttons or indicators)
  useEffect(
    () => {
      // Avoid scrolling on first mount, which would make the page scroll to the carousel when loaded
      if (!skippedMount && initialIndex < 2) {
        setSkippedMount(true);
        return;
      }

      if (!skippedMount && initialIndex >= 2) {
        slidesRef?.current?.scrollBy({
          behavior: "smooth",
          left: (slidesRef?.current?.children[initialIndex - 1] as HTMLElement)
            ?.offsetLeft,
        });
        setSkippedMount(true);
        return;
      }

      let nextSlideToScroll = slidesRef?.current?.children[
        curSlideIndex
      ] as HTMLElement;

      if (
        // If the slide isn't too high, we can be certain scrollIntoView's `block` won't lead to vertical scrolling
        nextSlideToScroll?.getBoundingClientRect().height <
        window.innerHeight - 50
      ) {
        nextSlideToScroll.scrollIntoView({
          behavior: "smooth",
          inline: "center", // scroll to the center of the slide
          block: "nearest", // avoids vertically scrolling the full window
        });
      } else {
        // Else, we need to scroll the carousel manually on the x-axis to avoid page-wide scrolls.
        // Thankfully, on non-chromium devices the carousel's scroll-snap CSS will ensure it scrolls to the right place in the slide.

        const slidesPerView = Number(1);
        const containerRect = slidesRef?.current?.getBoundingClientRect?.();

        const leftScrollPosition =
          // From the left position of the current slide,
          nextSlideToScroll?.offsetLeft -
          // discount the container's position &
          (containerRect?.x || 0) -
          // And now we have the slide on the left of the viewport. Let's finish the scroll by centering it:

          // Disconsidering the current slide, there are (slidesPerView - 1) * SLIDE_WIDTH of remaining space in the slides viewport.
          // Half of that is for the left, which we add to the final scroll position
          nextSlideToScroll?.getBoundingClientRect().width *
            ((slidesPerView - 1) / 2);

        slidesRef.current?.scrollTo({
          behavior: "smooth",
          left: leftScrollPosition,
        });
      }
    },

    // Don't re-run this effect when skippedMount changes, else it'd break its intention
    //eslint-disable-next-line
    [slidesRef, curSlideIndex, initialIndex]
  );

  function changeSlide(direction: "prev" | "next") {
    const slidesPerView = Math.floor(1);

    // If more than one slide per view, we can't just go to the nextSlide as it could already be on the screen,
    // leading to no scroll at all and a frustrating UX.
    //
    // Instead, we need to figure out what's the next _view_ and decide the slide index from that.
    const curViewIndex = Math.floor(curSlideIndex / slidesPerView);
    const newViewIndex = curViewIndex + (direction === "prev" ? -1 : +1);
    let nextSlide = newViewIndex * slidesPerView;

    // Ensure we aren't going overboard
    if (nextSlide < 0) {
      nextSlide = slidesCount - 1;
    }
    if (nextSlide >= slidesCount) {
      nextSlide = 0;
    }

    setSlideIndex(nextSlide);
  }

  return {
    changeSlide,
    slidesRef,
    curSlideIndex,
  };
}

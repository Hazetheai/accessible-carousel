This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Front-end controls

From the front-end you will see a carousel loaded up with images and an interactive slide.

The carousel can be navigated using trackpad scroll (mac), arrow keys and the directional buttons.

You may enable the overlays via te "Show Overlays" button to see how the focal slide, and next possible slide is calculated.

The slide highlighted in red is the focal slide. The red lines are the focal offset.
The blue overlays represent how much of the prev/next image must be visible before it is considered visible enough to skip

## Code

The main hook is `useCarouselNew.tsx` -- to be renamed once this UI element is finalized

The Markup is under `page.tsx` with basic layout elements in `layout.tsx`

Styles are in `globals.scss` & the carousel styles are in `carousel.scss`

Slides data lives in `slides-data.json`

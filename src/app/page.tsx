import products from '@/data/slides-data.json';
import Carousel from './components/Carousel';
import './globals.css';
export default async function Home() {
  return (
    <main className="xl:px-12 py-12 min-h-screen flex flex-col justify-between items-center">
      <h1 className="text-5xl mb-4 ml-10 xl:ml-0">
        How to develop an accessible carousel
      </h1>
      <a
        href="#next-section"
        className="skip-link p-4 m-8 bg-slate-100 rounded-sm"
      >
        Skip to next section
      </a>
      <Carousel products={products as any} />
    </main>
  );
}

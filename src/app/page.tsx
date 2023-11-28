import { client } from '@/utils/sanity/client';
import Carousel from './components/Carousel';
import './globals.css';
import { PRODUCT_FRAGMENT } from './queries';
export default async function Home() {
  const products = await client.fetch<any[]>(
    `*[_type == "product"]{
    ${PRODUCT_FRAGMENT}
  }`,
    { requestLocale: 'en' }
  );

  return (
    <main className="pl-2 xl:px-12 py-12 min-h-screen flex flex-col justify-between items-center">
      <h1 className="text-5xl mb-4 ml-[5%] xl:ml-0">
        How to develop an accessible carousel
      </h1>
      <a
        href="#next-section"
        className="skip-link p-4 m-8 bg-slate-100 rounded-sm"
      >
        Skip to next section
      </a>
      <Carousel products={products} />
    </main>
  );
}

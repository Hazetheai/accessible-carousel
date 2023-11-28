import Link from 'next/link';
import { ProductProps } from '../../types';
import { SlideImage } from './CarouselSlides';

const Product = ({ product, eagerImageLoad = false }: ProductProps) => {
  return (
    <div className="flex flex-col">
      <Link aria-label="View product" href={'#0'}>
        <div className="group relative bg-tertiary rounded h-0 pt-full">
          <SlideImage
            imgURL={product.src}
            altText={product.title}
            key={product._id}
            loading={eagerImageLoad ? 'eager' : 'lazy'}
          />
        </div>
      </Link>
      <div className="flex justify-between mt-2.5 bold text-xl">
        <span>{product.title}</span>
        <span>{product.price}</span>
      </div>
      <div className="mt-3.5">
        <div>{product.category}</div>
        <div className="flex items-center">
          <div>{product.colors.length} Colors</div>
          <div className="h-0.5 w-0.5 bg-primary mx-1.5" />
          <div>{product.sizes.length} Sizes</div>
        </div>
      </div>
    </div>
  );
};

export default Product;

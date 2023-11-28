import Link from 'next/link';
// import type { GlobalConfigurations } from '@/userTypes'
import { formatPrice } from '@/utils/formatPrice';
import { useGlobal } from './context/GlobalProvider';
import { SanityImage } from './SanityImage';
import _productData from '@/data/product-data.json';
import { ProductProps } from '../../types';
import { useState } from 'react';

const Product = ({
  product,
  eagerImageLoad = false,
}: //   translations,
ProductProps) => {
  const allColors =
    product.store.options.find((option: any) => option._key === 'Color')
      ?.values ?? [];
  const allSizes =
    product.store.options.find((option: any) => option._key === 'Size')
      ?.values ?? [];

  const {
    state: { locale, currency, cartOpen },
  } = useGlobal();
  const [isInCart, setIsInCart] = useState(false);
  return (
    <div className="flex flex-col">
      <Link
        aria-label="View product"
        // href={`${
        //   translations.locale === 'en' ? '' : `/${translations.locale}`
        // }/products/${product.store.slug.current}`}
        href={'#0'}
      >
        <div className="group relative bg-tertiary rounded h-0 pt-full">
          <SanityImage
            elProps={{
              className:
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full',
            }}
            image={product.images[0]}
            maxWidth={1200}
            loading={eagerImageLoad ? 'eager' : 'lazy'}
          />

          {product.hoverImage ? (
            <SanityImage
              elProps={{
                className:
                  'z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full opacity-0 group-hover:opacity-100 bg-tertiary rounded',
              }}
              image={product.hoverImage}
              maxWidth={1200}
            />
          ) : null}
        </div>
      </Link>
      <div className="flex justify-between mt-2.5 bold text-xl">
        <span>{product.displayTitle}</span>
        <span>
          {formatPrice(product.store.priceRange.minVariantPrice, currency)}
        </span>
      </div>
      <div className="mt-3.5">
        <div>{product.category.title}</div>
        <div className="flex items-center">
          <div>{`${
            allColors.length < 2
              ? product.translations.mixedColors
              : `${allColors.length} ${product.translations.colors}`
          }`}</div>
          <div className="h-0.5 w-0.5 bg-primary mx-1.5" />
          <div>
            {allSizes.length < 2
              ? product.translations.oneSize
              : `${allSizes.length} ${product.translations.sizes}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;

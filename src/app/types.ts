import _productData from '../data/product-data.json';
export type Product = typeof _productData;
export type ProductProps = {
  product: Product;
  eagerImageLoad?: boolean;
  //   translations: any;
};

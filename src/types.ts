import _productData from './data/slides-data.json';
export type Product = (typeof _productData)[0];
export type ProductProps = {
  product: Product;
  eagerImageLoad?: boolean;
};

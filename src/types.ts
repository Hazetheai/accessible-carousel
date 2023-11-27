import { DeepLinkData, MinimalDocForPath } from '@tinloof/js-toolkit';
import _productData from './data/product-data.json';
export type Product = typeof _productData;
export type ProductProps = {
  product: Product;
  eagerImageLoad?: boolean;
  //   translations: any;
};

export interface DocForPath extends MinimalDocForPath {
  // Add your custom path fields here
}

export interface LinkData {
  _type: 'link';
  linkType?: '' | 'external' | 'internal';

  /**
   * Absolute URL to another site site or internal section — `url`
   */
  url?: string;

  pageLink?: DocForPath;

  /**
   * (optional) where in the page the link should point to
   */
  deepLink?: DeepLinkData;

  /**
   * Open the link in a new window? — `boolean`
   */
  newWindow?: boolean;

  /**
   * Applicable only to internal link
   */
  utmParameters?: string;
}

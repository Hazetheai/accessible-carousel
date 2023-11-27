import ImageUrlBuilder from '@sanity/image-url';
import { createGetImageProps } from '@tinloof/js-toolkit';
import config from '@/config';

export const imageBuilder = ImageUrlBuilder(config.sanity);

export const getImageProps = createGetImageProps(imageBuilder);

import { getImageProps } from '@/utils/getImageProps';
import { SanityImageInternal } from './SanityImageInternal';

export function SanityImage(props: Parameters<typeof SanityImageInternal>[0]) {
  const imageProps = getImageProps(props);

  return <SanityImageInternal {...props} imageProps={imageProps} />;
}

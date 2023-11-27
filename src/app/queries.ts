const LOCALE_FILTER = 'locale == $requestLocale';

export const PRODUCT_FRAGMENT = /* groq */ `
  ...,
  "seo": localeSeo[$requestLocale],
  "displayTitle": displayTitle[$requestLocale],
  "displayDescription": displayDescription[$requestLocale],
  "category": category[$requestLocale]->,
  store {
    ...,
    variants[]->,
  },
  "translations": *[_type == 'globalConfigurations' && ${LOCALE_FILTER}][0]
`;

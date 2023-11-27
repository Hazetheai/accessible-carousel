import type { LocaleConfiguration, SingletonInfo } from '@tinloof/js-toolkit';
import { formatPath, getDeepLinkId, undraftId } from '@tinloof/js-toolkit';
import config from '@/config';
import type { DocForPath, LinkData } from '@/types';

export function pathToAbsUrl(path?: string): string | undefined {
  if (typeof path !== 'string') return;

  return (
    config.baseUrl +
    // When creating absolute URLs, ensure the homepage doesn't have a trailing slash
    (path === '/' ? '' : formatPath(path))
  );
}

export function localizePath(
  path?: string,
  locale?: LocaleConfiguration | LocaleConfiguration['value']
) {
  if (typeof path !== 'string') {
    return;
  }

  const localeValue =
    !!locale && typeof locale === 'object' ? locale.value : locale;
  if (!localeValue || localeValue === config.defaultLocale.value) {
    return formatPath(path);
  }

  return formatPath(`${localeValue}/${path}`);
}

export function getSingletonPath(
  singleton: SingletonInfo,
  locale: LocaleConfiguration | LocaleConfiguration['value'],
  /**
   * Whether to include the full path with the locale or not.
   * Used by `ensureSingletonsExist` (CLI) to add the unprefixed path of singletons to Sanity.
   */
  returnLocalized = true
) {
  const path =
    typeof singleton.routePath === 'string'
      ? singleton.routePath
      : singleton.routePath?.[
          typeof locale === 'string' ? locale : locale.value
        ];

  if (typeof path !== 'string') return;

  if (!returnLocalized) {
    return formatPath(path);
  }

  return localizePath(path, locale);
}

export function getDocumentPath(doc: DocForPath): string | undefined {
  if (typeof doc.routePath !== 'string') return;

  // Localize & format the final path
  return localizePath(doc.routePath, doc.locale);
}

export function getLinkProps(
  link?: LinkData,
  currentPathname?: string
):
  | undefined
  | (Partial<
      Pick<
        React.DetailedHTMLProps<
          React.AnchorHTMLAttributes<HTMLAnchorElement>,
          HTMLAnchorElement
        >,
        'rel' | 'target'
      >
    > & { href: string }) {
  if (
    !link ||
    !link.linkType ||
    (link.linkType === 'external' && !link.url) ||
    (link.linkType === 'internal' &&
      (!link.pageLink || !getDocumentPath(link.pageLink)))
  ) {
    return;
  }

  const queryParameters = link.utmParameters?.trim()
    ? `${
        link.utmParameters?.trim().startsWith('?') ? '' : '?'
      }${link.utmParameters?.trim()}`
    : '';
  const deepLinkSelector =
    getDeepLinkId(link.deepLink) &&
    link.deepLink?.parentDocumentId === link.pageLink?._id
      ? `#${getDeepLinkId(link.deepLink)}`
      : '';

  const href =
    link.linkType === 'external'
      ? link.url
      : (getDocumentPath(link.pageLink as DocForPath) || '') +
        // Add utm parameters, if any
        queryParameters +
        // Add the optional deep link to internal links
        deepLinkSelector;

  if (!href) {
    return;
  }

  const relParts = [
    link.newWindow && 'noopener noreferrer',
    href === currentPathname?.split('?')?.[0] && 'current',
  ].filter(Boolean);

  return {
    href,
    target: link.newWindow ? '_blank' : undefined,
    rel: relParts.length > 0 ? relParts.join(' ') : undefined,
  };
}

export function getDocumentPreviewUrl(doc: DocForPath): string | undefined {
  const parts = [
    ['_id', undraftId(doc._id)],
    ['_type', doc._type],
    ['locale', doc.locale],
  ];

  const docPath =
    getDocumentPath(doc) ||
    // If the document has no path, return a fake route that doesn't exist.
    // `routeLoader.ts` will handle it properly through the preview query parameters
    '/_preview';
  return typeof docPath === 'string'
    ? `/preview?${parts
        .filter(([_key, value]) => !!value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    : undefined;
}

export const toSnakeCase = (str = '') => {
  let value = str;

  if (Array.isArray(value)) {
    value = value[0];
  }

  try {
    const strArr = value.split(' ');

    const snakeArr = strArr.reduce((acc, val) => {
      // @ts-ignore
      return acc.concat(val.toLowerCase());
    }, []);
    return snakeArr.join('-');
  } catch (err) {
    return str;
  }
};

import { buildConfig, COMMON_IDS } from '@tinloof/js-toolkit';

export const TYPES_WITH_ROUTES = [
  'article',
  'blogTag',
  'brandGuidelines',
  'caseStudy',
  'country',
  'job',
  'jobCategory',
  'page',
  'proposals',
  'service',
  'servicesPage',
  'templatedPage',
  'technology',
];

const config = buildConfig({
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_ID as string,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
    // Not exposed to the front-end, used solely by the server
    token: process.env.SANITY_READ_TOKEN as string,
  },
  siteName: process.env.NEXT_PUBLIC_SITE_NAME as string,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL as string,
  themeColor: '#f00',

  gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID as string,

  locales: [
    {
      value: 'en',
      title: 'English',
      isDefault: true,
    },
  ],

  // Marking all singletons as non-localized for now since newer singleton generation script appends locale to the ID
  singletons: [
    {
      baseId: COMMON_IDS.settings,
      _type: 'settings',
      title: 'Global settings',
      localized: false,
    },
    {
      baseId: COMMON_IDS.headerNav,
      _type: 'headerNav',
      title: 'Header navigation',
      localized: false,
    },
    {
      baseId: COMMON_IDS.footer,
      _type: 'footer',
      title: 'Footer',
      localized: false,
    },
    {
      baseId: COMMON_IDS.notFound,
      _type: 'page',
      title: 'Not found page (404)',
      routePath: '404',
      localized: false,
    },
    {
      baseId: COMMON_IDS.homepage,
      _type: 'page',
      title: 'Homepage',
      routePath: '/',
      localized: false,
    },
    {
      baseId: 'blogIndex',
      _type: 'templatedPage',
      title: 'Blog home (index)',
      routePath: 'blog',
      localized: false,
    },
    {
      baseId: 'clientsIndex',
      _type: 'templatedPage',
      title: 'Clients index',
      routePath: 'clients',
      localized: false,
    },
    {
      baseId: 'jobsIndex',
      _type: 'templatedPage',
      title: 'Jobs index',
      routePath: 'jobs',
      localized: false,
    },
    {
      baseId: 'servicesIndexV2',
      _type: 'servicesPage',
      title: 'Services index',
      routePath: 'services',
      localized: false,
    },
    {
      baseId: 'servicesIndex',
      _type: 'templatedPage',
      title: 'Services index',
      routePath: 'services',
      localized: false,
    },
    {
      baseId: 'testimonialsIndex',
      _type: 'templatedPage',
      title: 'Testimonials index',
      routePath: 'testimonials',
      localized: false,
    },
    {
      baseId: 'workIndex',
      _type: 'templatedPage',
      title: 'Work / case studies index',
      routePath: 'work',
      localized: false,
    },
  ],

  // Auto-generated, don't edit this
  typesWithRoutes: TYPES_WITH_ROUTES,
});

export default config;

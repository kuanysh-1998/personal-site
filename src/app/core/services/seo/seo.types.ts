export const SITE_URL = 'https://kuanysh.dev';
export const SITE_NAME = 'Kuanysh Aptaizhanov';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;

export interface SeoData {
  /** Page title without the site-name suffix. */
  title: string;
  description?: string;
  /** Absolute or root-relative path of the canonical URL (e.g. `/blog/slug`). */
  path?: string;
  /** Open Graph type, defaults to `website`. */
  type?: 'website' | 'article';
  /** Absolute image URL for og:image / twitter:image. */
  image?: string;
}

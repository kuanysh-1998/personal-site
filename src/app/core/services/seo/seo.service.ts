import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DEFAULT_OG_IMAGE, SeoData, SITE_NAME, SITE_URL } from './seo.types';

@Injectable()
export class SeoService {
  private readonly _title = inject(Title);
  private readonly _meta = inject(Meta);
  private readonly _document = inject(DOCUMENT);

  public update(data: SeoData): void {
    const title = data.title ? `${data.title} | ${SITE_NAME}` : SITE_NAME;
    const description = data.description ?? '';
    const url = this._absoluteUrl(data.path);
    const image = data.image ?? DEFAULT_OG_IMAGE;
    const type = data.type ?? 'website';

    this._title.setTitle(title);

    this._meta.updateTag({ name: 'description', content: description });

    this._meta.updateTag({ property: 'og:title', content: title });
    this._meta.updateTag({ property: 'og:description', content: description });
    this._meta.updateTag({ property: 'og:url', content: url });
    this._meta.updateTag({ property: 'og:type', content: type });
    this._meta.updateTag({ property: 'og:image', content: image });

    this._meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this._meta.updateTag({ name: 'twitter:title', content: title });
    this._meta.updateTag({ name: 'twitter:description', content: description });
    this._meta.updateTag({ name: 'twitter:image', content: image });

    this._setCanonical(url);
  }

  private _absoluteUrl(path?: string): string {
    if (!path) {
      return SITE_URL;
    }
    return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private _setCanonical(url: string): void {
    let link = this._document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this._document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this._document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

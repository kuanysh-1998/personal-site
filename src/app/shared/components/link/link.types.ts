export type Links = Record<string, Link>;

export interface Link {
  text: string;
  url: string;
  download?: string;
  isPdf?: boolean;
}

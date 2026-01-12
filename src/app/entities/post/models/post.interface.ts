export interface PostMetadata {
  readonly title: string;
  readonly date: string;
  readonly slug: string;
  readonly description?: string;
}

export interface Post extends PostMetadata {
  readonly content: string;
}

export interface PostGroup {
  readonly year: number;
  readonly posts: PostMetadata[];
}

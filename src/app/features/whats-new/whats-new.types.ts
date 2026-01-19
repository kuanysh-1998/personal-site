import { PostMetadata } from '@app/entities/post/models/post.interface';

export interface WhatsNewFeature {
  title: string;
  description: string;
  date: Date;
  slug?: never;
}

export interface WhatsNewPost extends Omit<PostMetadata, 'date'> {
  date: Date;
}

export type WhatsNewItem = WhatsNewFeature | WhatsNewPost;

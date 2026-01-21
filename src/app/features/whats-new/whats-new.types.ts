import { Type } from '@angular/core';
import { PostMetadata } from '@app/entities/post/models/post.interface';

export const WHATS_NEW_ACTION_TYPES = {
  ROUTE: 'route',
  DIALOG: 'dialog',
} as const;

export type WhatsNewActionType =
  (typeof WHATS_NEW_ACTION_TYPES)[keyof typeof WHATS_NEW_ACTION_TYPES];

export interface WhatsNewFeatureActionRoute {
  type: typeof WHATS_NEW_ACTION_TYPES.ROUTE;
  route: string;
  label?: string;
}

export interface WhatsNewFeatureActionDialog {
  type: typeof WHATS_NEW_ACTION_TYPES.DIALOG;
  component: Type<unknown>;
  config?: {
    header?: string;
    submitButton?: string;
    cancelButton?: string;
  };
  label?: string;
}

export type WhatsNewFeatureAction = WhatsNewFeatureActionRoute | WhatsNewFeatureActionDialog;

export interface WhatsNewFeature {
  title: string;
  description: string;
  date: Date;
  action?: WhatsNewFeatureAction;
  slug?: never;
}

export interface WhatsNewPost extends Omit<PostMetadata, 'date'> {
  date: Date;
}

export type WhatsNewItem = WhatsNewFeature | WhatsNewPost;

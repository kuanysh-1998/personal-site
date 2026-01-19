import { WhatsNewFeature } from './whats-new.types';

export const WHATS_NEW_FEATURES: readonly WhatsNewFeature[] = [
  {
    title: 'Contact Form',
    description:
      'Added a contact form to reach out to me. You can send a message directly from the site',
    date: new Date('2026-01-17'),
  },
  {
    title: 'Table of Contents',
    description:
      'Added navigation through post content with automatic tracking of the current section',
    date: new Date('2026-01-16'),
  },
  {
    title: 'Code Copying',
    description: 'Now you can easily copy code examples from posts with a single click',
    date: new Date('2026-01-15'),
  },
  {
    title: 'Copy Post Link',
    description: 'Added the ability to quickly copy a direct link to a post for easy sharing',
    date: new Date('2026-01-14'),
  },
  {
    title: 'Share to Social Networks',
    description: 'Now you can share posts to popular social networks directly from the post page',
    date: new Date('2026-01-13'),
  },
];

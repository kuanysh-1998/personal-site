import { WhatsNewFeature, WHATS_NEW_ACTION_TYPES } from './whats-new.types';
import { ContactFormComponent } from '@app/features/contact-form/contact-form.component';

export const WHATS_NEW_FEATURES: readonly WhatsNewFeature[] = [
  {
    title: 'Print or save posts as PDF',
    description:
      'From a blog post, use the printer button next to Copy link to open the system dialog — you can print or save as PDF. The layout hides the site chrome, long code lines wrap to fit the page, and colors are tuned for paper or PDF.',
    date: new Date('2026-04-10'),
  },
  {
    title: 'Localization (EN, RU, KK)',
    description:
      "The site is now available in English, Russian and Kazakh. Switch the language using the dropdown in the header — your choice is saved. If you notice a section without translation yet, don't worry: we're gradually adding more translations and will cover everything soon.",
    date: new Date('2026-02-05'),
  },
  {
    title: 'Dark and Light Theme',
    description:
      'The site now supports two modes: dark and light. You can switch the theme with the button in the header — your choice is saved and will be used on your next visit.',
    date: new Date('2026-02-04'),
  },
  {
    title: 'Contact Form',
    description:
      'Added a contact form to reach out to me. You can send a message directly from the site',
    date: new Date('2026-01-17'),
    action: {
      type: WHATS_NEW_ACTION_TYPES.DIALOG,
      component: ContactFormComponent,
      config: {
        header: 'Contact Form',
        submitButton: 'Send',
        cancelButton: 'Cancel',
      },
      label: 'Open Contact Form',
    },
  },
  {
    title: 'Share to Social Networks',
    description: 'Now you can share posts to popular social networks directly from the post page',
    date: new Date('2026-01-13'),
  },
];

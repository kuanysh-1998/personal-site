# Personal Site

Modern personal website and blog built with Angular. Clean, minimalist design focused on content and performance.

## 🚀 Tech Stack

- **Angular 21** — Latest standalone components
- **TypeScript** — Type-safe development
- **RxJS** — Reactive programming
- **Signals API** — Modern state management
- **SCSS** — Styling with PT Root UI font
- **ngx-markdown** — Blog post rendering

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
ng serve

# Open http://localhost:4200
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── features/
│   │   ├── about/         # About page
│   │   └── blog/          # Blog with markdown posts
│   ├── shared/            # Reusable components
│   │   ├── header/        # Navigation
│   │   └── social-connect/# Contact links
│   └── layouts/           # Page layouts
├── assets/
│   ├── posts/             # Markdown blog posts
│   └── fonts/             # PT Root UI font files
└── styles/                # Global styles
```

## 📝 Adding Blog Posts

1. Create markdown file in `src/assets/posts/`
2. Add metadata to `src/app/features/blog/data/posts.data.ts`:

```typescript
{
  title: 'Your Post Title',
  date: '2025-01-12',
  slug: 'your-post-slug',
  description: 'Brief description'
}
```

## 🚢 Deployment

**Deploy to Vercel:**

```bash
# Push to GitHub
git push origin main

# Deploy via Vercel CLI or connect GitHub repo
vercel --prod
```

**Build for production:**

```bash
ng build
# Output in dist/
```

## 🔗 Live Site

Coming soon: [kuanysh.dev](https://kuanysh.dev)

## 📬 Contact

- Email: kuanysh.aptayzhanov@mail.ru
- LinkedIn: [linkedin.com/in/kuanyshaptaizhanov](https://linkedin.com/in/kuanyshaptaizhanov)
- GitHub: [github.com/kuanysh-1998](https://github.com/kuanysh-1998)
- Telegram: [@kuanysh_aptaizhanov](https://t.me/kuanysh_aptaizhanov)

## 📄 License

MIT © Kuanysh Aptaizhanov

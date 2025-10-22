# Blogity - Full-Stack Blogging Platform

A full-stack blogging platform built with Next.js 15 (App Router), tRPC, Drizzle ORM, PostgreSQL (Neon), Tailwind CSS, and shadcn/ui, fulfilling the requirements of the technical assessment.

**Live Demo:** [https://blogity-jx4hiz3xh-souhardya-sahas-projects.vercel.app/](https://blogity-jx4hiz3xh-souhardya-sahas-projects.vercel.app/)

**GitHub Repository:** [https://github.com/Souhardya05/Blogity.git](https://github.com/Souhardya05/Blogity.git)

---

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **API:** tRPC
- **Database:** PostgreSQL (Hosted on Neon)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS (v4)
- **UI Components:** shadcn/ui
- **Schema Validation:** Zod
- **State Management:** React Query (via tRPC)
- **Theme:** next-themes (Dark Mode)
- **Markdown:** react-markdown + remark-gfm
- **Deployment:** Vercel

---

## ✅ Features Implemented

### Priority 1: Must Haves
- [x] Blog post CRUD (Create, Read, Update, Delete)
- [x] Category CRUD
- [x] Assign multiple categories to posts
- [x] Blog listing page (`/blog`)
- [x] Individual post view page (`/posts/[slug]`)
- [x] Category filtering on listing page
- [x] Basic responsive navigation
- [x] Clean, professional UI

### Priority 2: Should Haves
- [x] Landing page (`/`) with 3 sections (Header/Hero, Features, Footer)
- [x] Dashboard page (`/dashboard`) for post management
- [x] Draft vs. Published post status
- [x] Loading and error states handled
- [x] Mobile-responsive design
- [x] Content editor (Markdown support implemented)

### Priority 3: Nice to Haves
- [x] Dark mode support
- [x] Search functionality for posts (by title)
- [x] Post statistics (word count, reading time)
- [ ] ~~Full 5-section landing page~~ (Implemented 4 sections)
- [ ] ~~Advanced rich text editor features~~ (Chose Markdown)
- [ ] ~~Image upload for posts~~ (Skipped due to complexity/time)
- [ ] ~~Post preview functionality~~ (Skipped due to time)
- [ ] ~~SEO meta tags~~
- [ ] ~~Pagination~~

---

## 🔧 Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Souhardya05/Blogity.git](https://github.com/Souhardya05/Blogity.git)
    cd Blogity
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the project root and add your Neon database connection string:
    ```
    DATABASE_URL="your-postgres-connection-string"
    ```
4.  **Sync the database schema:**
    ```bash
    npx drizzle-kit push
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architectural Decisions & Trade-offs

- **State Management:** Used tRPC's React Query integration for server state management (fetching, caching, mutations). Did not implement Zustand as there wasn't a clear need for global client-side state, avoiding potential over-engineering.
- **Content Editor:** Chose Markdown (`react-markdown`) over a rich text editor as suggested in the prompt to save time. Successfully implemented markdown rendering and styling using `@tailwindcss/typography`.
- **Database:** Used Neon for a quick and easy hosted PostgreSQL setup.
- **Styling:** Leveraged shadcn/ui heavily for rapid UI development. Utilized Tailwind v4 alongside `tailwind.config.ts` for plugin management (`@tailwindcss/typography`, `tailwindcss-animate`). Correctly configured `postcss.config.mjs` to ensure plugins load correctly.
- **Optimistic Updates:** Implemented for post deletion on the dashboard for a better UX.
- **Middleware:** Added simple tRPC logging middleware to demonstrate understanding.
- **Deployment Build Issues:** Encountered and resolved several local build issues related to file permissions (EPERM), missing dependencies (`autoprefixer`, `@tailwindcss/postcss`), and configuration conflicts, ensuring the final code builds cleanly on Vercel.

---

## 📝 tRPC Router Structure

The tRPC routers are organized by domain within the `/server/routers` directory:
- `_app.ts`: The main app router that merges all other routers.
- `post.ts`: Handles all CRUD operations, filtering, and searching for blog posts.
- `category.ts`: Handles all CRUD operations for categories.

Procedures use Zod for input validation, and a logging middleware is applied globally via `server/trpc.ts`.

---

**Time Spent:** Approximately 18 hours.

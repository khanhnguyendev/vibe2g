# vibe2g - Collaborative Youtube Watch Party

**vibe2g** is a premium, real-time collaborative video watching platform built with **Next.js 16** and **Tailwind CSS v4**. It features a stunning glassmorphism UI, a deep dark mode aesthetic, and seamless synchronization for watching YouTube videos with friends.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

- **Real-time Sync**: Watch videos in perfect harmony with zero latency.
- **Premium Glass UI**: A modern, frosted-glass aesthetic with fluid animations.
- **Deep Dark Mode**: Optimized for late-night binge-watching sessions.
- **Interactive Room**:
    - **Video Player**: Custom overlay controls and theater mode.
    - **Live Chat**: Real-time messaging with user presence.
    - **Queue System**: Manage upcoming videos with auto-play support.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS Transitions
- **Font**: Inter & Outfit (via `next/font`)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/khanhnguyendev/vibe2g.git
    cd vibe2g
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout with fonts & providers
│   ├── page.tsx          # Landing page
│   └── room/[id]/        # Dynamic room route
├── components/
│   ├── layout/           # Global layout components (Navbar)
│   ├── room/             # Room-specific components (Player, Chat, Queue)
│   └── ui/               # Reusable UI primitives (Button, Card, Input)
├── lib/                  # Utilities (cn, helpers)
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

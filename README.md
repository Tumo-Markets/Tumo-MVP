# Tumo Markets (Frontend MVP)

**Tumo Markets** is a decentralized Oracle-based Shared Liquidity Pool built natively on the **OneChain** ecosystem. This repository contains the Frontend interface for the Tumo Markets MVP, developed as part of the **OneChain Builders' Hub Grant**.

> ⚠️ **Note:** This repository is strictly for the **Frontend Interface**.
> The Move Smart Contracts are located in a separate repository: [Tumo Contract Repo](https://github.com/Tumo-Markets/Tumo-Contract)

## 🚀 Key Features (Milestone 1)

- **Native OneChain Integration:** Fully integrated with **OneWallet SDK** for seamless transaction signing.
- **Strict Network Handling:** Automatically detects and enforces connection to **OneChain Testnet** (`oct test`).
- **Real-time Trading UI:** Interactive price charts (TradingView), leverage slider (1x-20x), and position management dashboard.
- **Clean Architecture:** Built with Next.js & TypeScript, free from multi-chain clutter (No EVM/Wagmi dependencies).

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Wallet Connection:** **OneWallet SDK** (Native Adapter)
- **State Management:** Zustand / React Context

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- **Node.js** (LTS version recommended)
- **npm** (usually included with Node.js)

## Getting Started

Follow these steps to set up the project locally.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Tumo-Markets/Tumo-MVP.git
    cd Tumo-MVP
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

## Running Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ⚠️ License & Copyright Notice

**This project is the proprietary property of A-Star Group and its core members.**

**Copyright (c) 2026:**
* A-Star Group
* Truong Gia Bach
* Tran Quoc Viet Quang
* Nguyen Duc Thang
* Dang Manh Cuong
* Luong Hoai Nam

**All Rights Reserved.**
Unauthorized use, copying, modification, or distribution of this source code is strictly prohibited. Only the individuals and entities listed above have the right to use this software for any purpose.

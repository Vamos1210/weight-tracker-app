This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

--------------------------

# Weight Tracker App

毎日の体重記録を、最小工数で継続できるよう設計したPWA体重管理アプリです。

## 概要

- スマホ向け最適化UI
- PWA対応
- Google Spreadsheet連携
- 日次の体重推移グラフ表示
- 小数点入力不要な体重入力UX

---

# 使用技術

| 技術 | 用途 |
|---|---|
| Next.js | フロントエンド |
| TypeScript | 型安全 |
| Tailwind CSS | UIデザイン |
| Recharts | グラフ表示 |
| Google Apps Script | API |
| Google Spreadsheet | データ保存 |
| Vercel | ホスティング |

---

# 工夫したポイント

## 1. スマホ・PCでレイアウトを最適化

- スマホでは1画面完結UI
- PCでは横長ダッシュボードUI
- iPhone表示を基準に余白・サイズを最適化

---

## 2. 体重入力工数を削減

小数点入力を不要化。

例：

```text
633 → 63.3kg
```

数字3桁だけで入力可能。

毎日入力する前提のため、
「1タップでも減らす」ことを重視。

---

## 3. 日付スライダーUX

- カレンダーUIではなく横スライダー採用
- 「今日」を中央に自動配置
- 当日を視覚的に強調

日次入力で最も触る範囲だけに集中できるよう設計。

---

## 4. Google Spreadsheet連携

Google Apps ScriptをAPI化し、

```text
Next.js
↓
GAS
↓
Spreadsheet
```

構成でデータ保存。

非エンジニアでもデータ確認・編集しやすい構成を意識。

---

# 今後追加予定

- 体脂肪率管理
- 前日比表示
- 通知機能
- 週間平均
- 月次分析
- ダークモード
- Face IDロック

---

# 起動方法

```bash
npm install
npm run dev
```

---

# デプロイ

Vercelへデプロイ済み。

---

# 作者

個人開発 / AIペアプログラミングで制作

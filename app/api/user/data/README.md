# 🏃‍♂️ Strava Accountability

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/banksoalgere/strava/graphs/commit-activity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

![Strava Accountability Banner](./public/banner.png)

### **Commit. Track. Achieve.**
Strava Accountability is a performance-driven platform that integrates your Strava activity with a financial accountability mechanism. Set your fitness goals, track your progress, and stay committed—because failure now has a price.

---

## ✨ Features

- **🔄 Strava Sync**: Seamless integration with Strava API to pull your latest activities automatically.
- **🎯 Custom Goals**: Set specific targets for distance, moving time, elevation, or activity count.
- **💳 Financial Accountability**: Connect your Stripe account and set "stakes" for your goals. Fail your goal, pay the penalty.
- **📊 Performance Dashboard**: Beautifully designed analytics to track your progress over time.
- **⚡ Premium UI/UX**: A sleek, dark-themed interface built with Framer Motion and Tailwind CSS.
- **🔐 Secure Auth**: Robust authentication powered by NextAuth.js.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe API](https://stripe.com/)
- **Activity Data**: [Strava API](https://developers.strava.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/banksoalgere/strava.git
cd strava
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/strava_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Strava API
STRAVA_CLIENT_ID="your-strava-client-id"
STRAVA_CLIENT_SECRET="your-strava-client-secret"
STRAVA_REDIRECT_URI="http://localhost:3000/api/auth/callback/strava"

# Stripe API
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app in action.

---

## 🛡 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Developed with ❤️ by [Joshua](https://github.com/banksoalgere)

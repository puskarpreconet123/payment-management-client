# 💳 Paynexa UI — Payment Orchestration Frontend

A production-grade React dashboard for the Paynexa payment platform. Built with Vite, TailwindCSS, and Axios.

---

## ✨ Design System

- **Theme**: Dark fintech — deep navy base (`#060b18`) with emerald-teal accent system
- **Typography**: Sora (UI) + DM Mono (data/code)
- **Components**: Glassmorphism cards, status badges, paginated tables, modals
- **Motion**: CSS keyframe animations, hover micro-interactions, page transitions

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui.jsx               # Logo, StatusBadge, StatsCard, Modal, Pagination, etc.
│   ├── AdminSidebar.jsx
│   ├── MerchantSidebar.jsx
│   ├── Header.jsx
│   └── Layouts.jsx          # Protected route wrappers
├── pages/
│   ├── AdminLogin.jsx
│   ├── MerchantLogin.jsx
│   ├── AdminDashboard.jsx
│   ├── Merchants.jsx
│   ├── MIDManagement.jsx
│   ├── Transactions.jsx
│   ├── WebhookLogs.jsx
│   ├── MerchantDashboard.jsx
│   ├── CreatePayment.jsx
│   ├── MerchantTransactions.jsx
│   ├── APISettings.jsx
│   ├── WebhookSettings.jsx
│   └── CheckoutPage.jsx     # Public QR + UPI checkout
├── services/
│   └── api.js               # Axios instance + all API calls
├── context/
│   └── AuthContext.jsx      # JWT / token auth state
├── App.jsx                  # All routes
├── main.jsx
└── index.css                # Tailwind + custom component classes
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd Paynexa-ui
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000
```

> Leave blank (`VITE_API_URL=`) to use the Vite proxy (recommended for local dev).

### 3. Start the dev server

```bash
npm run dev
```

Runs at: `http://localhost:5173`

> The Vite proxy forwards `/api/*` and `/webhooks/*` to `http://localhost:3000` automatically.

### 4. Build for production

```bash
npm run build
```

---

## 🗺️ Routes

| Path                       | Page                     | Auth          |
|----------------------------|--------------------------|---------------|
| `/login`                   | Admin Login              | Public        |
| `/merchant/login`          | Merchant Login           | Public        |
| `/checkout/:paymentId`     | UPI Checkout + QR        | Public        |
| `/admin`                   | Admin Dashboard          | Admin JWT     |
| `/admin/merchants`         | Merchant Management      | Admin JWT     |
| `/admin/mids`              | MID Management           | Admin JWT     |
| `/admin/transactions`      | All Transactions         | Admin JWT     |
| `/admin/webhook-logs`      | Webhook Delivery Logs    | Admin JWT     |
| `/merchant`                | Merchant Dashboard       | API Token     |
| `/merchant/create-payment` | Create UPI Payment       | API Token     |
| `/merchant/transactions`   | Transaction History      | API Token     |
| `/merchant/api-settings`   | API Token Management     | API Token     |
| `/merchant/webhook-settings` | Webhook Configuration  | API Token     |

---

## 🔐 Authentication Flow

**Admin:**
1. POST `/api/admin/login` → receives `{ token, admin }`
2. JWT stored in `localStorage` as `rf_token`
3. Axios interceptor attaches `Authorization: Bearer <token>` to all requests

**Merchant:**
1. POST `/api/merchant/login` → receives `{ token, merchant }`
2. After login, the merchant's `api_token` from profile is used for payment API calls
3. Same Axios interceptor handles attachment

---

## 💡 Key Features

### Admin Dashboard
- Summary cards (merchants, transactions, success/failure counts)
- Recent transactions table
- Full merchant CRUD with enable/disable toggle
- MID creation with provider configuration
- Paginated transaction viewer with status filters
- Webhook delivery log monitoring

### Merchant Dashboard
- Payment stats overview
- Create payment → auto-redirects to checkout page
- Transaction history with status filters
- API token display, masking, copy, and regeneration
- Webhook URL configuration with retry policy docs

### Checkout Page (`/checkout/:paymentId`)
- Displays amount and payment details
- Generates real QR code via `qrcode` library
- UPI deep link button for mobile UPI apps
- Countdown timer (5-minute expiry)
- Auto-polls status every 5 seconds
- Transitions to success/failure state automatically

---

## 📦 Dependencies

| Package         | Purpose                                    |
|-----------------|--------------------------------------------|
| react           | UI framework                               |
| react-router-dom| Client-side routing                        |
| axios           | HTTP client with interceptors              |
| qrcode          | QR code generation for UPI checkout        |
| lucide-react    | Icon library                               |
| tailwindcss     | Utility-first CSS                          |
| vite            | Build tool + dev server                    |

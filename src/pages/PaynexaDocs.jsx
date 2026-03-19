import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Menu } from "lucide-react";
  
const BASE_URL = import.meta.env.VITE_API_URL
const TABS = ["Create Order", "Handle Response", "Callback (POST)", "Get Transaction"];

const badge = (method) => {
  const isPost = method === 'POST';
  const isGet = method === 'GET';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider mr-2.5 border ${
      isPost ? 'bg-blue-50 text-blue-700 border-blue-200' :
      isGet ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
      'bg-gray-100 text-gray-700 border-gray-200'
    }`}>
      {method}
    </span>
  );
};

const Code = ({ children, lang = "" }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-3 shadow-sm">
    {lang && (
      <div className="bg-gray-800/80 border-b border-gray-700/50 px-4 py-2 text-[11px] text-gray-400 font-mono tracking-wide">
        {lang}
      </div>
    )}
    <pre className="m-0 p-5 text-[13px] leading-relaxed text-gray-100 font-mono overflow-x-auto whitespace-pre">
      {children}
    </pre>
  </div>
);

const Step = ({ n, title, children }) => (
  <div className="flex gap-4 mb-7">
    <div className="min-w-[32px] w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[13px] font-bold text-emerald-700 shrink-0 mt-0.5 shadow-sm">
      {n}
    </div>
    <div className="flex-1">
      <div className="font-bold text-gray-900 text-[15px] mb-1.5">{title}</div>
      <div className="text-gray-600 text-[14px] leading-relaxed">{children}</div>
    </div>
  </div>
);

const Chip = ({ label, value }) => (
  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 mb-2 shadow-sm">
    <span className="text-emerald-700 font-mono font-bold text-[13px] min-w-[140px]">{label}</span>
    <span className="text-gray-600 text-[13px]">{value}</span>
  </div>
);

const Note = ({ type = "info", children }) => {
  const styles = {
    info:    { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-800",    icon: "text-blue-600",    iconChar: "ℹ" },
    warning: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   icon: "text-amber-600",   iconChar: "⚠" },
    success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "text-emerald-600", iconChar: "✓" },
  };
  const s = styles[type] || styles.info;
  
  return (
    <div className={`${s.bg} border ${s.border} rounded-xl p-3.5 mt-3.5 flex gap-3 items-start shadow-sm`}>
      <span className={`${s.icon} font-bold text-[14px] mt-0.5`}>{s.iconChar}</span>
      <span className={`${s.text} text-[13px] leading-relaxed font-medium`}>{children}</span>
    </div>
  );
};

// ─── TABS ──────────────────────────────────────────────────────────────────────

function CreateOrder() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-1.5">
          {badge("POST")}
          <span className="font-mono text-[14px] font-semibold text-gray-900">
            /api/payments/create
          </span>
        </div>
        <p className="text-gray-500 text-[14px] m-0 leading-relaxed">
          Authenticated with your API token. Paynexa creates the payment order, forwards to RupeeFlow, and returns a UPI payment link.
        </p>
      </div>

      <div className="text-gray-400 text-[11px] font-bold mb-2 tracking-widest uppercase">
        Required Fields
      </div>
      <Chip label="amount"          value="Float — min 10, max 100000" />
      <Chip label="order_id"        value="String — your unique order reference" />
      <Chip label="customer_name"   value="String" />
      <Chip label="customer_email"  value="String — valid email" />
      <Chip label="customer_mobile" value="String — 10-digit Indian number" />

      <div className="mt-4">
        <Note type="info">
          Optional: <code className="text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded font-mono text-[12px]">callback_url</code> (Server-to-server POST notification),{" "}
          <code className="text-blue-700 bg-blue-100/50 px-1.5 py-0.5 rounded font-mono text-[12px]">redirect_url</code> (Customer redirect after payment).
        </Note>
      </div>

      <Code lang="javascript">{`const response = await fetch("${BASE_URL}/api/payments/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
  },
  body: JSON.stringify({
    amount: 499.00,
    order_id: "ORD-2024-001",
    customer_name: "Rahul Sharma",
    customer_email: "rahul@example.com",
    customer_mobile: "9876543210",
    callback_url: "https://yoursite.com/callback",   // optional
    redirect_url: "https://yoursite.com/success"   // optional
  })
});

const data = await response.json();`}</Code>
    </div>
  );
}

function HandleResponse() {
  return (
    <div>
      <p className="text-gray-600 text-[14px] mt-0 mb-5 leading-relaxed">
        On success, you receive <strong className="text-gray-900">HTTP 201</strong> with the payment details.
        Show the <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[12px]">payment_url</code> or <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[12px]">qr_code</code> to your customer.
      </p>

      <Code lang="json — success response (201)">{`{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "payment_id":   "pay_a1b2c3d4e5",     // store this — use for status checks
    "order_id":     "ORD-2024-001",
    "status":       "CREATED",
    "qr_string":    "upi://pay?pa=merchant@upi&...",
    "upi_link":     "upi://pay?pa=merchant@upi&...",
    "checkout_url": "${BASE_URL}/checkout/PAY_MMPZS6P0_85FE2807",
    "expiry_time":  "2026-03-14T07:21:20.180Z",
    "idempotent":   false
  }
}`}</Code>

      <div className="mt-8 text-gray-400 text-[11px] font-bold mb-3 tracking-widest uppercase">
        Payment Status Values
      </div>

      {[
        ["CREATED",   "text-blue-600", "Payment order created, awaiting customer"],
        ["PENDING",   "text-amber-600", "Awaiting customer payment"],
        ["SUCCESS",   "text-emerald-600", "Payment received and confirmed"],
        ["FAILED",    "text-red-600", "Payment failed or rejected"],
        ["EXPIRED",   "text-gray-500", "Customer didn't pay in time"],
        ["CANCELLED", "text-gray-500", "Cancelled via API"],
      ].map(([s, c, d]) => (
        <div key={s} className="flex items-center gap-3 p-2.5 mb-2 bg-gray-50 border border-gray-200 rounded-lg">
          <span className={`min-w-[90px] font-mono text-[12px] font-bold ${c}`}>
            {s}
          </span>
          <span className="text-gray-600 text-[13px]">{d}</span>
        </div>
      ))}

      <Note type="warning">
        If you send the same <code className="text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded font-mono text-[12px]">order_id</code> twice, Paynexa returns the existing payment (HTTP 200) instead of creating a duplicate — handle this in your code.
      </Note>
    </div>
  );
}

function CallbackURL() {
  return (
    <div>
      <p className="text-gray-600 text-[14px] mt-0 mb-5 leading-relaxed">
        When a payment reaches a final state, Paynexa sends <strong className="text-gray-900">two consecutive POST requests</strong> to your provided <code>callback_url</code>:
      </p>

      <div className="mb-6">
        <Note type="info">
          1. <strong className="text-blue-900">Standard Notification</strong>: Formatted Paynexa response (see below).<br/>
          2. <strong className="text-blue-900">Raw Provider Callback</strong>: The exact payload received from the payment gateway.
        </Note>
      </div>

      <div>
        <Step n="1" title="Register Callback URL">
          Pass the <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[12px]">callback_url</code> parameter when creating the order. Paynexa will automatically send the payment status to this endpoint.
        </Step>
        
        <Step n="2" title="Success Response">
          For successful payments, we POST the status along with the <strong className="text-gray-900">UTR number</strong> and complete transaction details.
        </Step>

        <Code lang="json — callback (SUCCESS)">{`{
  "status": "SUCCESS",
  "amount": 499,
  "payment_id": "pay_a1b2c3d4e5",
  "order_id": "ORD-2024-001",
  "utr": "303124567890",
  "currency": "INR",
  "customer_name": "Rahul Sharma",
  "timestamp": "2024-03-13T11:14:22.000Z"
}`}</Code>

        <Step n="3" title="Failure Response">
          If the payment fails, we pass the <code className="text-gray-600 font-mono text-[12px]">payment failed</code> status to your endpoint.
        </Step>

        <Code lang="json — callback (FAILED)">{`{
  "status": "FAILED",
  "amount": 499,
  "payment_id": "pay_a1b2c3d4e5",
  "order_id": "ORD-2024-001",
  "utr": "null",
  "currency": "INR",
  "customer_name":"Rahul Sharma",
  "timestamp": "2024-03-13T11:14:22.000Z"
}`}</Code>

        <Note type="info">
          Ensure your endpoint is prepared to receive JSON data via POST and returns an <strong className="text-blue-900">HTTP 200</strong> response to acknowledge receipt.
        </Note>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <p className="text-gray-900 text-[14px] font-bold mb-2">
          REST API ENQUIRY (Polling)
        </p>
        <p className="text-gray-600 text-[13px] mb-5">
          You can also manually enquire about the status using a GET request if needed.
        </p>

        <div className="flex items-center mb-2">
          {badge("GET")}
          <span className="font-mono text-[14px] font-semibold text-gray-900">
            /api/payments/:payment_id
          </span>
        </div>

        <Note type="success">
          Paynexa proactively syncs with the provider on every status enquiry to ensure you get the most accurate result.
        </Note>
      </div>
    </div>
  );
}

function GetTransaction() {
  const [mode, setMode] = useState("id");
  return (
    <div>
      <p className="text-gray-600 text-[14px] mt-0 mb-5 leading-relaxed">
        Two ways to look up transaction details — by payment ID or by date (for reconciliation).
      </p>

      <div className="flex gap-2 mb-6 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200">
        {[["id", "By Payment ID"], ["date", "By Date"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={`
            px-4 py-2 rounded-lg cursor-pointer font-semibold text-[13px] transition-all
            ${mode === k 
              ? 'bg-white text-emerald-600 shadow-sm border border-gray-200/50' 
              : 'bg-transparent text-gray-500 border border-transparent hover:text-gray-700'
            }
          `}>{l}</button>
        ))}
      </div>

      {mode === "id" && (
        <div>
          <div className="flex items-center mb-2.5">
            {badge("GET")}
            <span className="font-mono text-[14px] font-semibold text-gray-900">
              /api/payments/:payment_id
            </span>
          </div>
          <Code lang="javascript">{`const res = await fetch(
  "${BASE_URL}/api/payments/pay_a1b2c3d4e5",
  { headers: { Authorization: "Bearer YOUR_API_TOKEN" } }
);
const { data } = await res.json();`}</Code>

          <Code lang="json — response">{`{
  "success": true,
  "data": {
    "payment_id":  "pay_a1b2c3d4e5",
    "order_id":    "ORD-2024-001",
    "amount":      499,
    "status":      "SUCCESS",
    "utr":         "303124567890",
    "createdAt":   "2024-03-13T11:00:00.000Z",
    "updatedAt":   "2024-03-13T11:14:22.000Z"
  }
}`}</Code>
<Code lang="json — not found (404)">{`{
  "success": false,
  "message": "Payment not found"
}`}</Code>
        </div>
      )}

{mode === "date" && (
  <div>
    <div className="flex items-center mb-1.5">
      {badge("POST")}
      <span className="font-mono text-[14px] font-semibold text-gray-900">
        /api/payments/date-wise-payment
      </span>
    </div>
    <p className="text-gray-600 text-[13px] my-2 mb-3">
      Look up transactions by <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[12px]">order_id</code> or <code className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono text-[12px]">txn_date</code>. At least one is required.
    </p>

    <Code lang="javascript">{`const res = await fetch(
  "${BASE_URL}/api/payments/date-wise-payment",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_TOKEN"
    },
    body: JSON.stringify({
      order_id: "ORD-2024-001",  
      txn_date: "2024-03-13"     // format — YYYY-MM-DD
    })
  }
);
const data = await res.json();`}</Code>

    <Code lang="json — response">{`{
  "success": true,
  "message": "Success",
  "data": {
    "total": 1,
    "payments": [
      {
        "payment_id": "PAY_MMNQLKE5_D53ECC5F",
        "order_id":   "ord_007",
        "amount":     499,
        "currency":   "INR",
        "status":     "SUCCESS",
       "createdAt":   "2024-03-13T11:00:00.000Z",
       "updatedAt":   "2024-03-13T11:14:22.000Z"
      }
    ]
  }
}`}</Code>

    <Note type="info">
      If no matching transaction is found, <code className="text-blue-700 font-mono text-[12px]">total</code> returns <code className="text-blue-700 font-mono text-[12px]">0</code> and <code className="text-blue-700 font-mono text-[12px]">payments</code> returns an empty array — not an error.
    </Note>
  </div>
)}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-gray-900 text-[14px] font-bold mb-3 tracking-wide">
          LIST ALL PAYMENTS
        </div>
        <div className="flex items-center mb-2">
          {badge("GET")}
          <span className="font-mono text-[14px] font-semibold text-gray-900 break-all">
            /api/payments?status=SUCCESS&page=1&limit=20
          </span>
        </div>
        <Code lang="javascript">{`const res = await fetch(
  "${BASE_URL}/api/payments?status=SUCCESS&page=1",
  { headers: { Authorization: "Bearer YOUR_API_TOKEN" } }
);
// Returns paginated list with total count`}</Code>
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

export default function PaynexaDocs() {
  const { setSidebarOpen } = useOutletContext();
  const [tab, setTab] = useState(0);

  const content = [<CreateOrder />, <HandleResponse />, <CallbackURL />, <GetTransaction />];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans py-10 px-4">
      <div className="max-w-[840px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="bg-transparent border-none cursor-pointer text-gray-500 p-1 flex items-center lg:hidden hover:text-gray-900"
              >
                <Menu size={20} />
              </button>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[16px] font-black text-white shadow-sm shadow-emerald-500/20">
                P
              </div>
              <span className="text-[22px] font-bold text-gray-900 tracking-tight">
                Paynexa
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">
                API Docs
              </span>
            </div>
            <p className="text-gray-500 text-[14px] m-0 leading-relaxed">
              Base URL: <code className="text-gray-600 font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm ml-1 mr-2">
                {BASE_URL}
              </code>
              <span className="opacity-30 mx-1 border-l border-gray-400 h-4 inline-block align-middle"></span>
              <span className="ml-2">Auth:</span> <code className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-sm ml-1">
                Bearer Token
              </code>
            </p>
          </div>

          {/* Tab Bar */}
          <div className="mb-6">
            <div className="flex gap-1.5 bg-gray-100/50 border border-gray-200 rounded-xl p-1.5 flex-wrap overflow-x-auto shadow-inner">
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} className={`
                  flex-1 min-w-max px-3.5 py-2 rounded-lg cursor-pointer font-semibold text-[13px] transition-all whitespace-nowrap
                  ${tab === i
                    ? "bg-white text-emerald-600 shadow-sm border border-gray-200/60"
                    : "bg-transparent text-gray-500 border border-transparent hover:text-gray-700 hover:bg-gray-100/50"
                  }
                `}>{t}</button>
              ))}
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-7 mb-6 shadow-sm">
            <div className="text-[18px] font-bold text-gray-900 mb-6 tracking-tight">
              {TABS[tab]}
            </div>
            {content[tab]}
          </div>

          {/* Quick steps footer */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-[11px] font-bold text-gray-400 tracking-widest mb-5 text-center uppercase">
              Integration Workflow
            </div>
            <div className="flex justify-between gap-3 flex-wrap">
              {[
                ["1", "API Token", "Merchant settings"],
                ["2", "Create",  "POST /create"],
                ["3", "Pay",  "Customer QR"],
                ["4", "Callback",  "POST handler"],
                ["5", "Fulfil",  "Order success"],
              ].map(([n, t, s]) => (
                <div key={n} className="flex-1 min-w-[100px] text-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[13px] font-bold text-emerald-700 mx-auto mb-2 shadow-sm">
                    {n}
                  </div>
                  <div className="text-[13px] font-bold text-gray-900 mb-0.5">{t}</div>
                  <div className="text-[11px] font-medium text-gray-500">{s}</div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
import { useState } from "react";

const BASE_URL = window.location.origin;

const TABS = ["Create Order", "Handle Response", "Callback (POST)", "Get Transaction"];

const badge = (method) => {
  const styles = {
    POST: { bg: "#3B82F6", color: "#fff" },
    GET:  { bg: "#10B981", color: "#fff" },
  };
  const s = styles[method] || { bg: "#6B7280", color: "#fff" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, fontFamily: "monospace",
      padding: "2px 8px", borderRadius: 4, letterSpacing: 1,
      marginRight: 10
    }}>{method}</span>
  );
};

const Code = ({ children, lang = "" }) => (
  <div style={{
    background: "#0D1117", border: "1px solid #21262D",
    borderRadius: 10, overflow: "hidden", marginTop: 12
  }}>
    {lang && (
      <div style={{
        background: "#161B22", borderBottom: "1px solid #21262D",
        padding: "6px 16px", fontSize: 11, color: "#8B949E",
        fontFamily: "monospace", letterSpacing: 0.5
      }}>{lang}</div>
    )}
    <pre style={{
      margin: 0, padding: "18px 20px",
      fontSize: 13, lineHeight: 1.7, color: "#E6EDF3",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      overflowX: "auto", whiteSpace: "pre"
    }}>{children}</pre>
  </div>
);

const Step = ({ n, title, children }) => (
  <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
    <div style={{
      minWidth: 32, height: 32, borderRadius: "50%",
      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2
    }}>{n}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, color: "#F0F6FF", fontSize: 15, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#8B949E", fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </div>
  </div>
);

const Chip = ({ label, value }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 8,
    background: "#161B22", border: "1px solid #21262D",
    borderRadius: 8, padding: "8px 14px", marginBottom: 8
  }}>
    <span style={{ color: "#7EE787", fontFamily: "monospace", fontSize: 13, minWidth: 140 }}>{label}</span>
    <span style={{ color: "#8B949E", fontSize: 13 }}>{value}</span>
  </div>
);

const Note = ({ type = "info", children }) => {
  const styles = {
    info:    { bg: "#0D2137", border: "#1D6FA4", icon: "ℹ", color: "#58A6FF" },
    warning: { bg: "#1C1500", border: "#9E6A03", icon: "⚠", color: "#D29922" },
    success: { bg: "#0A1F0A", border: "#2EA043", icon: "✓", color: "#3FB950" },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: "12px 16px", marginTop: 14,
      display: "flex", gap: 10, alignItems: "flex-start"
    }}>
      <span style={{ color: s.color, fontWeight: 700, fontSize: 14, marginTop: 1 }}>{s.icon}</span>
      <span style={{ color: "#CDD9E5", fontSize: 13, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
};

// ─── TABS ──────────────────────────────────────────────────────────────────────

function CreateOrder() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
          {badge("POST")}
          <span style={{ fontFamily: "monospace", fontSize: 14, color: "#58A6FF" }}>
            /api/payments/create
          </span>
        </div>
        <p style={{ color: "#8B949E", fontSize: 14, margin: 0 }}>
          Authenticated with your API token. Paynexa creates the payment order, forwards to RupeeFlow, and returns a UPI payment link.
        </p>
      </div>

      <div style={{ color: "#CDD9E5", fontSize: 13, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>
        REQUIRED FIELDS
      </div>
      <Chip label="amount"          value="Float — min 10, max 100000" />
      <Chip label="order_id"        value="String — your unique order reference" />
      <Chip label="customer_name"   value="String" />
      <Chip label="customer_email"  value="String — valid email" />
      <Chip label="customer_mobile" value="String — 10-digit Indian number" />

      <div style={{ marginTop: 12 }}>
        <Note type="info">
          Optional: <code style={{ color: "#58A6FF" }}>callback_url</code> (Server-to-server POST notification),{" "}
          <code style={{ color: "#58A6FF" }}>redirect_url</code> (Customer redirect after payment).
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
      <p style={{ color: "#8B949E", fontSize: 14, marginTop: 0, marginBottom: 20 }}>
        On success, you receive <strong style={{ color: "#E6EDF3" }}>HTTP 201</strong> with the payment details.
        Show the <code style={{ color: "#58A6FF" }}>payment_url</code> or <code style={{ color: "#58A6FF" }}>qr_code</code> to your customer.
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

      <div style={{ marginTop: 24, color: "#CDD9E5", fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>
        PAYMENT STATUS VALUES
      </div>

      {[
        ["CREATED",  "#58A6FF", "Payment order created, awaiting customer"],
        ["PENDING",   "#D29922", "Awaiting customer payment"],
        ["SUCCESS",   "#3FB950", "Payment received and confirmed"],
        ["FAILED",    "#F85149", "Payment failed or rejected"],
        ["EXPIRED",   "#8B949E", "Customer didn't pay in time"],
        ["CANCELLED", "#8B949E", "Cancelled via API"],
      ].map(([s, c, d]) => (
        <div key={s} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 14px", marginBottom: 4,
          background: "#0D1117", borderRadius: 6,
          border: "1px solid #21262D"
        }}>
          <span style={{
            minWidth: 90, fontFamily: "monospace", fontSize: 12,
            fontWeight: 700, color: c
          }}>{s}</span>
          <span style={{ color: "#8B949E", fontSize: 13 }}>{d}</span>
        </div>
      ))}

      <Note type="warning">
        If you send the same <code style={{ color: "#D29922" }}>order_id</code> twice, Paynexa returns the existing payment (HTTP 200) instead of creating a duplicate — handle this in your code.
      </Note>
    </div>
  );
}

function CallbackURL() {
  return (
    <div>
      <p style={{ color: "#8B949E", fontSize: 14, marginTop: 0, marginBottom: 20 }}>
        When a payment reaches a final state, Paynexa sends <strong>two consecutive POST requests</strong> to your providing <code>callback_url</code>:
      </p>

      <div style={{ marginBottom: 24 }}>
        <Note type="info">
          1. <strong>Standard Notification</strong>: Formatted Paynexa response (see below).<br/>
          2. <strong>Raw Provider Callback</strong>: The exact payload received from the payment gateway.
        </Note>
      </div>

      <div>
        <Step n="1" title="Register Callback URL">
          Pass the <code style={{ color: "#58A6FF" }}>callback_url</code> parameter when creating the order. Paynexa will automatically send the payment status to this endpoint.
        </Step>
        
        <Step n="2" title="Success Response">
          For successful payments, we POST the status along with the <strong>UTR number</strong> and complete transaction details.
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
          If the payment fails, we pass the <code>payment failed</code> status to your endpoint.
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
          Ensure your endpoint is prepared to receive JSON data via POST and returns an <strong>HTTP 200</strong> response to acknowledge receipt.
        </Note>
      </div>

      <div style={{ marginTop: 32, borderTop: "1px solid #21262D", paddingTop: 24 }}>
        <p style={{ color: "#CDD9E5", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          REST API ENQUIRY (Polling)
        </p>
        <p style={{ color: "#8B949E", fontSize: 13, marginBottom: 20 }}>
          You can also manually enquire about the status using a GET request if needed.
        </p>

        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          {badge("GET")}
          <span style={{ fontFamily: "monospace", fontSize: 14, color: "#3FB950" }}>
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
      <p style={{ color: "#8B949E", fontSize: 14, marginTop: 0, marginBottom: 20 }}>
        Two ways to look up transaction details — by payment ID or by date (for reconciliation).
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["id", "By Payment ID"], ["date", "By Date"]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} style={{
            padding: "7px 18px", borderRadius: 6, cursor: "pointer",
            fontWeight: 600, fontSize: 13, border: "none",
            background: mode === k ? "#1F6FEB" : "#21262D",
            color: mode === k ? "#fff" : "#8B949E",
            transition: "all 0.2s"
          }}>{l}</button>
        ))}
      </div>

      {mode === "id" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            {badge("GET")}
            <span style={{ fontFamily: "monospace", fontSize: 14, color: "#3FB950" }}>
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
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
      {badge("POST")}
      <span style={{ fontFamily: "monospace", fontSize: 14, color: "#58A6FF" }}>
        /api/payments/date-wise-payment
      </span>
    </div>
    <p style={{ color: "#8B949E", fontSize: 13, margin: "8px 0 12px" }}>
      Look up transactions by <code style={{ color: "#58A6FF" }}>order_id</code> or <code style={{ color: "#58A6FF" }}>txn_date</code>. At least one is required.
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
      If no matching transaction is found, <code style={{ color: "#58A6FF" }}>total</code> returns <code style={{ color: "#58A6FF" }}>0</code> and <code style={{ color: "#58A6FF" }}>payments</code> returns an empty array — not an error.
    </Note>
  </div>
)}
      <div style={{ marginTop: 28 }}>
        <div style={{ color: "#CDD9E5", fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>
          LIST ALL PAYMENTS
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          {badge("GET")}
          <span style={{ fontFamily: "monospace", fontSize: 14, color: "#3FB950" }}>
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
  const [tab, setTab] = useState(0);

  const content = [<CreateOrder />, <HandleResponse />, <CallbackURL />, <GetTransaction />];

  return (
    <div style={{
      minHeight: "100%",
      background: "#010409",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "40px 16px"
    }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "linear-gradient(135deg, #1F6FEB, #6366F1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: "#fff"
              }}>P</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#F0F6FF", letterSpacing: -0.5 }}>
                Paynexa
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: "#58A6FF",
                background: "#0D2137", border: "1px solid #1D6FA4",
                padding: "2px 8px", borderRadius: 20
              }}>API DOCS</span>
            </div>
            <p style={{ color: "#8B949E", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Base URL: <code style={{ color: "#58A6FF", background: "#0D1117", padding: "2px 8px", borderRadius: 4 }}>
                {BASE_URL}
              </code>
              <span style={{ margin: "0 10px", opacity: 0.3 }}>|</span>
              Auth: <code style={{ color: "#7EE787", background: "#0D1117", padding: "2px 8px", borderRadius: 4 }}>
                Bearer Token
              </code>
            </p>
          </div>

          {/* Tab Bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", gap: 4,
              background: "#0D1117", border: "1px solid #21262D",
              borderRadius: 10, padding: 4, flexWrap: "wrap",
              overflowX: "auto"
            }}>
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} style={{
                  flex: "1 1 auto",
                  padding: "9px 14px", borderRadius: 7, cursor: "pointer",
                  fontWeight: 600, fontSize: 13, border: "none",
                  background: tab === i
                    ? "linear-gradient(135deg, #1F6FEB22, #6366F122)"
                    : "transparent",
                  color: tab === i ? "#58A6FF" : "#8B949E",
                  transition: "all 0.15s",
                  boxShadow: tab === i ? "0 0 0 1px #1D6FA4" : "none",
                  whiteSpace: "nowrap"
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Content Card */}
          <div style={{
            background: "#0D1117", border: "1px solid #21262D",
            borderRadius: 12, padding: "28px", marginBottom: 20
          }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: "#F0F6FF",
              marginBottom: 20, letterSpacing: -0.3
            }}>{TABS[tab]}</div>
            {content[tab]}
          </div>

          {/* Quick steps footer */}
          <div style={{
            background: "#0D1117", border: "1px solid #21262D",
            borderRadius: 12, padding: "20px 28px"
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#565f69", letterSpacing: 1.5, marginBottom: 20, textAlign: "center", textTransform: "uppercase" }}>
              INTEGRATION WORKFLOW
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              {[
                ["1", "API Token", "Merchant settings"],
                ["2", "Create",  "POST /create"],
                ["3", "Pay",  "Customer QR"],
                ["4", "Callback",  "POST handler"],
                ["5", "Fulfil",  "Order success"],
              ].map(([n, t, s]) => (
                <div key={n} style={{ flex: "1 1 auto", minWidth: 120, textAlign: "center", marginBottom: 15 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1F6FEB, #6366F1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "#fff", margin: "0 auto 8px"
                  }}>{n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#CDD9E5", marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 11, color: "#8B949E" }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
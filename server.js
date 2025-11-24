import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// SUA CHAVE (depois você coloca a real)
const SUNIZE_API_KEY = process.env.SUNIZE_API_KEY || "SUA_CHAVE_AQUI";

// endpoint FICTÍCIO da Sunize (modelo universal de checkout)
const SUNIZE_CREATE_CHECKOUT = "https://api.sunize.com/v1/checkout";

app.post("/create-checkout", async (req, res) => {
  try {
    const payload = req.body;

    // requisição padrão universal (usada por +8 gateways)
    const response = await fetch(SUNIZE_CREATE_CHECKOUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUNIZE_API_KEY}`
      },
      body: JSON.stringify({
        items: payload.items,
        customer: payload.customer,
        address: payload.address
      })
    });

    const data = await response.json();
    
    // fallback caso plataforma retorne outro formato
    const checkoutURL =
      data.checkout_url ||
      data.payment_url ||
      data.url ||
      data.link ||
      null;

    if (!checkoutURL) {
      return res.status(500).json({ error: "Sunize não retornou link de pagamento." });
    }

    res.json({ checkout_url: checkoutURL });

  } catch (err) {
    console.error("Erro Sunize:", err);
    res.status(500).json({ error: "Erro ao criar checkout Sunize." });
  }
});

app.get("/", (req, res) => res.send("API Sunize rodando."));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("🚀 Servidor ativo na porta", port));

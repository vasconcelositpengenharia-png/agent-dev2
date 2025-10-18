// Importa as bibliotecas necessárias do Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "npm:openai"

// Define cabeçalhos CORS para permitir que a função seja chamada de qualquer lugar.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

console.log("INFO: Função 'agent-dev-main' inicializada e pronta para receber requisições.")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      console.warn(`WARN: Método não permitido recebido: ${req.method}`)
      return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }})
    }

    const payload = await req.json()
    console.log("INFO: Payload recebido com sucesso:", JSON.stringify(payload, null, 2))

    // 1. INTELIGÊNCIA: Extrai a informação chave do payload.
    const selectedPlan = payload.plan;
    console.log(`INFO: Plano selecionado identificado: ${selectedPlan}`);

    // 2. INTELIGÊNCIA: Toma uma decisão com base na informação.
    switch (selectedPlan) {
      case "Site Inteligente Avançado":
        console.log("INFO: Iniciando fluxo para Site Inteligente Avançado.");
        
        // Busca segura do segredo APENAS para este fluxo.
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (openaiApiKey) {
          console.log("INFO: Segredo OPENAI_API_KEY recuperado com sucesso.");

          // 3. INTELIGÊNCIA: Executa a ação criativa (Chama a OpenAI).
          try {
            const openaiClient = new OpenAI({ apiKey: openaiApiKey });
            const completion = await openaiClient.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "user", content: "Gere um slogan para uma casa de materiais de construção" }
              ],
            });
            
            const slogan = completion.choices[0].message.content;
            console.log(`INFO: Resposta da OpenAI recebida: ${slogan}`);

          } catch (err) {
            console.error("ERROR: Erro ao se comunicar com a API da OpenAI:", err);
          }

        } else {
          console.warn("WARN: Segredo OPENAI_API_KEY não encontrado.");
        }

        break;
      case "ZapFácil Avançado":
        console.log("INFO: Iniciando fluxo para ZapFácil Avançado.");
        break;
      default:
        console.log(`WARN: Plano desconhecido recebido: ${selectedPlan}`);
        break;
    }

    // Retorna uma resposta de sucesso.
    return new Response(JSON.stringify({ message: "Dados recebidos com sucesso pelo AgentDev e plano identificado." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("ERROR: Erro crítico ao processar a requisição:", error)
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }})
  }
})
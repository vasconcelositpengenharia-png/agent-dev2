// Importa as bibliotecas necessárias do Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define cabeçalhos CORS para permitir que a função seja chamada de qualquer lugar (como Canva ou Typebot).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

console.log("INFO: Função 'agent-dev-main' inicializada e pronta para receber requisições.")

// A função 'serve' cria um servidor que escuta por requisições HTTP.
serve(async (req) => {
  // Responde a requisições OPTIONS (necessárias para CORS).
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Garante que a requisição seja do método POST, o padrão para webhooks.
    if (req.method !== "POST") {
      console.warn(`WARN: Método não permitido recebido: ${req.method}`)
      return new Response(JSON.stringify({ error: "Método não permitido" }), {
        status: 405, // 405 Method Not Allowed
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Extrai o payload (os dados) do corpo da requisição.
    const payload = await req.json()

    // Ponto de verificação crucial: registra os dados recebidos no log.
    console.log("INFO: Payload recebido com sucesso:", JSON.stringify(payload, null, 2))

    // *** AQUI ENTRARÁ A LÓGICA PRINCIPAL DO AGENTDEV NO FUTURO ***
    // 1. Analisar o payload.
    // 2. Chamar a API da OpenAI.
    // 3. Chamar a API do Resend.

    // Retorna uma resposta de sucesso confirmando o recebimento.
    return new Response(JSON.stringify({ message: "Dados recebidos com sucesso pelo AgentDev." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    // Em caso de qualquer erro, registra e retorna uma resposta de erro genérica.
    console.error("ERROR: Erro crítico ao processar a requisição:", error)
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
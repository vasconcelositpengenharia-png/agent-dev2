// Importa as bibliotecas necessárias do Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "npm:openai"
import { Resend } from "npm:resend"

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

    const selectedPlan = payload.plan;
    console.log(`INFO: Plano selecionado identificado: ${selectedPlan}`);

    switch (selectedPlan) {
      case "Site Inteligente Avançado":
        console.log("INFO: Iniciando fluxo para Site Inteligente Avançado.");
        
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (openaiApiKey) {
          console.log("INFO: Segredo OPENAI_API_KEY recuperado com sucesso.");

          try {
            const openaiClient = new OpenAI({ apiKey: openaiApiKey });
            
            const details = payload.details ?? "um negócio";
            const prompt = `Sua tarefa é gerar exatamente 3 slogans para o negócio a seguir. Responda APENAS com a lista numerada dos slogans e nada mais.\n\nNegócio: "${details}"`;

            const completion = await openaiClient.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [ { role: "user", content: prompt } ],
            });
            
            const slogans = completion.choices[0].message.content;
            console.log(`INFO: Resposta da OpenAI recebida:\n${slogans}`);

            // 4. INTELIGÊNCIA: Reporta o sucesso da missão (Envia o e-mail).
            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            if (resendApiKey) {
              console.log("INFO: Segredo RESEND_API_KEY recuperado com sucesso.");
              try {
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                  from: "agent-dev@resend.dev",
                  to: "vasconcelos.itpengenharia@gmail.com",
                  subject: "AgentDev: Novos Slogans Gerados",
                  html: `<p>Novos slogans gerados para o cliente:</p><pre>${slogans}</pre>`,
                });
                console.log("INFO: Email de notificação enviado com sucesso via Resend.");
              } catch (emailErr) {
                console.error("ERROR: Falha ao enviar email via Resend:", emailErr);
              }
            } else {
              console.warn("WARN: Segredo RESEND_API_KEY não encontrado.");
            }

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

    return new Response(JSON.stringify({ message: "Dados recebidos com sucesso pelo AgentDev e plano identificado." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("ERROR: Erro crítico ao processar a requisição:", error)
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }})
  }
})
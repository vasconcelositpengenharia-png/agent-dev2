// Importa as bibliotecas necessárias do Deno.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "npm:openai"
import { Resend } from "npm:resend"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

console.log("INFO: Função 'agent-dev-main' (PRODUÇÃO FINAL) inicializada.") // Mensagem atualizada

serve(async (req) => {
  if (req.method === "OPTIONS") { return new Response("ok", { headers: corsHeaders }) }

  try {
    if (req.method !== "POST") {
      console.warn(`WARN: Método não permitido recebido: ${req.method}`)
      return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }})
    }

    const payload = await req.json()
    console.log("INFO: Payload recebido:", JSON.stringify(payload, null, 2))
    const selectedPlan = payload.plan;

    switch (selectedPlan) {
      case "Site Inteligente Avançado":
        console.log("INFO: Iniciando fluxo para Site Inteligente Avançado.");
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (openaiApiKey) {
          console.log("INFO: Segredo OPENAI_API_KEY recuperado.");
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

            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            if (resendApiKey) {
              console.log("INFO: Segredo RESEND_API_KEY recuperado.");
              try {
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                  from: "agent-dev@resend.dev",
                  to: "vasconcelos.itpengenharia@gmail.com", // Confirme se este é o email correto
                  subject: "AgentDev: Novos Slogans Gerados",
                  html: `<p>Novos slogans gerados para o projeto ${payload.projectName || 'sem nome'}:</p><pre>${slogans}</pre>`, // Adicionado nome do projeto
                });
                console.log("INFO: Email de notificação enviado com sucesso.");
              } catch (emailErr) {
                console.error("ERROR: Falha ao enviar email via Resend:", emailErr);
              }
            } else { console.warn("WARN: Segredo RESEND_API_KEY não encontrado no Vault."); }
          } catch (err) { console.error("ERROR: Erro na API da OpenAI:", err); }
        } else { console.warn("WARN: Segredo OPENAI_API_KEY não encontrado no Vault."); }
        break;
      default:
        console.log(`WARN: Plano desconhecido: ${selectedPlan}`);
        break;
    }
    // Mensagem de sucesso final
    return new Response(JSON.stringify({ message: "AgentDev executou a missão com sucesso." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }})
  } catch (error) {
    console.error("ERROR: Erro crítico no handler principal:", error)
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }})
  }
})
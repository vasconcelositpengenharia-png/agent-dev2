import { serve } from "https://deno.land/std@0.168.0/http/server.ts" // <-- LINHA RESTAURADA

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

console.log("-> LUZ 1: Função 'agent-dev-main' (DIAGNÓSTICO FINAL CORRIGIDO) inicializada.");

serve(async (req) => { // <-- AGORA 'serve' ESTÁ DEFINIDO
  console.log("-> LUZ 2: Requisição atingiu o handler 'serve'.");
  console.log(`-> LUZ 3: Método HTTP recebido: ${req.method}`);

  if (req.method === "OPTIONS") {
    console.log("-> LUZ 4: Processando requisição OPTIONS.");
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method === "POST") {
     console.log("-> LUZ 5 (POST): Requisição POST recebida! A porta está aberta.");
     return new Response(
       JSON.stringify({ message: "DIAGNÓSTICO FINAL: Requisição POST recebida com sucesso." }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     )
  }

  console.warn(`-> ALERTA: Método inesperado recebido: ${req.method}`);
  return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }})
})
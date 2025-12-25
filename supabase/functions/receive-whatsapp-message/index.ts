import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    console.log('Received WhatsApp message:', JSON.stringify(body));
    
    // Dados esperados do n8n/WhatsApp:
    // { protocol, sender_name, message, sender_phone }
    const { protocol, sender_name, message, sender_phone } = body;

    if (!protocol || !message) {
      console.error('Missing required fields: protocol or message');
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: protocol, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar o benefit_request pelo protocolo
    const { data: request, error: reqError } = await supabase
      .from('benefit_requests')
      .select('id, user_id')
      .eq('protocol', protocol)
      .single();

    if (reqError || !request) {
      console.error('Protocol not found:', protocol, reqError);
      return new Response(
        JSON.stringify({ error: 'Protocolo não encontrado', protocol }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found request:', request.id, 'for user:', request.user_id);

    // Salvar mensagem na tabela request_messages
    const { data: insertedMessage, error: msgError } = await supabase
      .from('request_messages')
      .insert({
        benefit_request_id: request.id,
        sender_id: request.user_id, // ID do colaborador (dono da solicitação)
        sender_name: sender_name || 'Colaborador',
        message: message,
        sent_via: 'whatsapp',
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error inserting message:', msgError);
      throw msgError;
    }

    console.log('Message saved successfully:', insertedMessage.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem salva com sucesso',
        message_id: insertedMessage.id,
        request_id: request.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in receive-whatsapp-message:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

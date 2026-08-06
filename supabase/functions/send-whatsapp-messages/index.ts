import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN")!;
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Service role key bypasses RLS
);

serve(async (req) => {
  // Allow requests from any origin (CORS) for convenience
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDate = today.getDate(); // 1-31

    // Fetch records to send using an RPC function to avoid DATE type casting issues in Postgres
    const { data: records, error: fetchError } = await supabase
      .rpc('get_pending_birthday_records', {
        c_month: currentMonth,
        c_day: currentDate,
        c_year: currentYear
      })
      .limit(15);

    if (fetchError) throw fetchError;

    if (!records || records.length === 0) {
      return new Response(JSON.stringify({ message: "No records to process today" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const results = [];

    for (const record of records) {
      // Clean phone number (leave only digits)
      let phone = (record.phone_number || '').replace(/\D/g, '');
      if (!phone.startsWith("91") && phone.length === 10) {
        phone = "91" + phone;
      }

      // WhatsApp API template request
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
              name: "birthday_wishes",
              language: {
                code: "en",
              },
            },
          }),
        }
      );

      const responseData = await whatsappResponse.json();

      if (whatsappResponse.ok) {
        const msgId = responseData.messages?.[0]?.id;
        await supabase
          .from("records")
          .update({
            status: "Sent",
            last_year_sent: currentYear,
            whatsapp_message_id: msgId,
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq("id", record.id);

        results.push({ id: record.id, status: "success", msgId });
      } else {
        const errMsg = responseData.error?.message || "Unknown Meta API error";
        await supabase
          .from("records")
          .update({
            status: "Error",
            error_message: errMsg,
            sent_at: new Date().toISOString()
          })
          .eq("id", record.id);

        results.push({ id: record.id, status: "failed", error: errMsg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});

// ==========================================
// Cloudflare Worker — hualianhistory Gemini API 安全代理
// API Key 仅存于 env.GEMINI_API_KEY，永不下发
// 部署: npx wrangler deploy (需先 npx wrangler secret put GEMINI_API_KEY)
// ==========================================

const rateMap = new Map();

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // --- CORS 白名单（禁止 null/空 origin，防止 curl/脚本调用） ---
    const isAllowed =
      origin === 'https://chewyenhan.github.io' ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1');

    if (!isAllowed) {
      return new Response('CORS Blocked', { status: 403 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // --- GET /models ---
    if (url.pathname === '/models' && request.method === 'GET') {
      return new Response(JSON.stringify({
        models: [
          { name: 'models/gemini-3.5-flash-lite', displayName: 'Gemini 3.5 Flash Lite (免费推荐)' },
          { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash (更强·困难题更准·实测可用)' }
        ]
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- POST /gemini（带速率限制） ---
    if (url.pathname === '/gemini' && request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const now = Date.now();
      const windowMs = 60_000;
      const maxReq = 15;

      let entry = rateMap.get(ip);
      if (!entry || (now - entry.resetAt) > windowMs) {
        entry = { count: 0, resetAt: now + windowMs };
        rateMap.set(ip, entry);
      }

      entry.count++;
      if (entry.count > maxReq) {
        return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (Math.random() < 0.01) {
        for (const [k, v] of rateMap) {
          if (now > v.resetAt) rateMap.delete(k);
        }
      }

      try {
        const body = await request.json();
        const model = body.model || 'gemini-3.5-flash-lite';
        const usedModel = model.replace('models/', '');

        const geminiBody = { contents: body.contents };
        if (body.system_instruction) geminiBody.system_instruction = body.system_instruction;
        if (body.generationConfig) geminiBody.generationConfig = body.generationConfig;

        const t0 = Date.now();
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${usedModel}:generateContent?key=${env.GEMINI_API_KEY}`;
        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody)
        });
        const t1 = Date.now();
        const respText = await resp.text();
        const t2 = Date.now();

        const geminiResp = JSON.parse(respText);
        geminiResp._timing = { api_ms: t1 - t0, body_ms: t2 - t1, total_ms: t2 - t0 };

        return new Response(JSON.stringify(geminiResp), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'AI 请求失败: ' + e.message, stack: e.stack }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

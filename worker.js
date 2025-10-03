// Cloudflare Worker - proxy.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Chỉ cho phép truy cập từ domain GitHub Pages của bạn
    const allowedOrigin = 'https://yourusername.github.io';
    
    // Kiểm tra referer hoặc origin
    const referer = request.headers.get('referer') || '';
    if (!referer.startsWith(allowedOrigin)) {
      return new Response('Truy cập bị từ chối. Vui lòng truy cập qua gateway.', { 
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // Proxy đến Notion
    const notionURL = 'https://young-mastodon-f07.notion.site/2800bc1073c28033a764f18b145aad02';
    
    try {
      const response = await fetch(notionURL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      let html = await response.text();
      
      // Thêm script để chặn truy cập trực tiếp
      const securityScript = `
        <script>
          // Chặn nếu truy cập trực tiếp không qua proxy
          if (!document.referrer.includes('yourusername.github.io')) {
            window.location.href = 'https://yourusername.github.io/notion-gateway';
          }
          
          // Chặn right-click và copy (tùy chọn)
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
          });
        </script>
      `;
      
      html = html.replace('</head>', securityScript + '</head>');
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      return new Response('Lỗi proxy: ' + error.message, { status: 500 });
    }
  }
};

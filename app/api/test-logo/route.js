import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Check if logo files exist
    const logoFiles = [
      '/desktopLogo.png',
      '/footer/logo.webp',
      '/mobileLogo.png',
      '/mobileLogoBlue.png'
    ];
    
    const logoStatus = {};
    
    for (const logoPath of logoFiles) {
      const fullPath = path.join(publicDir, logoPath);
      const exists = fs.existsSync(fullPath);
      const stats = exists ? fs.statSync(fullPath) : null;
      
      logoStatus[logoPath] = {
        exists,
        size: stats ? stats.size : 0,
        lastModified: stats ? stats.mtime : null
      };
    }
    
    // Create HTML page to display logo test
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Logo Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; }
          .logo-test { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .logo-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
          .logo-item img { max-width: 100px; max-height: 100px; border: 1px solid #eee; }
          .status { margin: 10px 0; }
          .exists { color: green; font-weight: bold; }
          .missing { color: red; font-weight: bold; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Logo File Test</h1>
          
          <div class="logo-test">
            <h2>File Status</h2>
            <pre>${JSON.stringify(logoStatus, null, 2)}</pre>
          </div>
          
          <div class="logo-test">
            <h2>Logo Display Test</h2>
            <div class="logo-grid">
              <div class="logo-item">
                <h3>Desktop Logo (PNG)</h3>
                <img src="/desktopLogo.png" alt="Desktop Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <p style="display:none; color:red;">❌ Failed to load</p>
                <div class="status">
                  <span class="${logoStatus['/desktopLogo.png'].exists ? 'exists' : 'missing'}">
                    ${logoStatus['/desktopLogo.png'].exists ? '✅ Exists' : '❌ Missing'}
                  </span>
                  ${logoStatus['/desktopLogo.png'].exists ? `(${logoStatus['/desktopLogo.png'].size} bytes)` : ''}
                </div>
              </div>
              
              <div class="logo-item">
                <h3>Footer Logo (WEBP)</h3>
                <img src="/footer/logo.webp" alt="Footer Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <p style="display:none; color:red;">❌ Failed to load</p>
                <div class="status">
                  <span class="${logoStatus['/footer/logo.webp'].exists ? 'exists' : 'missing'}">
                    ${logoStatus['/footer/logo.webp'].exists ? '✅ Exists' : '❌ Missing'}
                  </span>
                  ${logoStatus['/footer/logo.webp'].exists ? `(${logoStatus['/footer/logo.webp'].size} bytes)` : ''}
                </div>
              </div>
              
              <div class="logo-item">
                <h3>Mobile Logo (PNG)</h3>
                <img src="/mobileLogo.png" alt="Mobile Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <p style="display:none; color:red;">❌ Failed to load</p>
                <div class="status">
                  <span class="${logoStatus['/mobileLogo.png'].exists ? 'exists' : 'missing'}">
                    ${logoStatus['/mobileLogo.png'].exists ? '✅ Exists' : '❌ Missing'}
                  </span>
                  ${logoStatus['/mobileLogo.png'].exists ? `(${logoStatus['/mobileLogo.png'].size} bytes)` : ''}
                </div>
              </div>
              
              <div class="logo-item">
                <h3>Mobile Logo Blue (PNG)</h3>
                <img src="/mobileLogoBlue.png" alt="Mobile Logo Blue" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <p style="display:none; color:red;">❌ Failed to load</p>
                <div class="status">
                  <span class="${logoStatus['/mobileLogoBlue.png'].exists ? 'exists' : 'missing'}">
                    ${logoStatus['/mobileLogoBlue.png'].exists ? '✅ Exists' : '❌ Missing'}
                  </span>
                  ${logoStatus['/mobileLogoBlue.png'].exists ? `(${logoStatus['/mobileLogoBlue.png'].size} bytes)` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="logo-test">
            <h2>Instructions</h2>
            <p>1. Check if the logos display above</p>
            <p>2. If logos show as "❌ Failed to load", there's a path or file issue</p>
            <p>3. If logos display correctly, the issue is with the admin layout implementation</p>
            <p>4. Use the working logo path in the admin layout</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Logo test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

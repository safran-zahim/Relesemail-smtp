import type { FormData } from './types';
import { featureIcons } from './icons';

// ── Utility Functions ──────────────────────────────────────────────────────
function hexToRgba(hex: string, opacityPercent: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert opacity percentage to 0-1 scale
  const alpha = opacityPercent / 100;
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Category Icons ─────────────────────────────────────────────────────────
function getToggleSwitchIcon(iconName?: string, customIconDataUrl?: string): string {
  if (customIconDataUrl) {
    return `<img src="${customIconDataUrl}" height="32" alt="icon" style="display:inline-block;height:32px;width:auto;vertical-align:middle;margin-right:12px;border:0;">`;
  }
  if (iconName && featureIcons[iconName]) {
    return `<img src="${featureIcons[iconName]}" height="32" alt="icon" style="display:inline-block;height:32px;width:auto;vertical-align:middle;margin-right:12px;border:0;">`;
  }
  return '';
}

// ── Main generator ──────────────────────────────────────────────────
export function generateEmailHTML(data: FormData): string {
  const brand = data.brandColor || '#f97316';
  const company = data.companyName || 'OrangeHRM';
  const product = data.productName || 'OrangeHRM';
  const version = data.version || '8.1';
  const tagline = data.tagline || 'Is Out As a Stable Version';
  const resolvedLogoSrc = data.logoUrl && data.logoUrl.trim()
    ? data.logoUrl
    : '/orangehrm-logo.png';
  const logoElement = `<img src="${resolvedLogoSrc}" height="60" alt="${company}" style="display:inline-block;height:60px;width:auto;max-width:200px;border:0;">`;
  const mailWidth = 600;


  const innerBg = 'background-color:#050a1f;';
  const opacity1 = data.footerGradientOpacity1 || 13;
  const opacity2 = data.footerGradientOpacity2 || 27;
  
  let footerBg = '#050a1f';
  if (data.footerGradient && data.footerGradient.trim()) {
    footerBg = data.footerGradient;
  } else if (opacity1 > 1 || opacity2 > 1) {
    // Only show gradient if at least one color has opacity > 1%
    footerBg = `linear-gradient(135deg,${hexToRgba(data.footerGradientColor1 || brand, opacity1)},${hexToRgba(data.footerGradientColor2 || brand, opacity2)})`;
  }


  // ── Feature category glass cards ──────────────────────────────────────────
  const categoriesHTML = data.featureCategories
    .filter(c => c.name.trim() && c.items.some(i => i.text.trim()))
    .map(cat => {
      const itemsHTML = cat.items
        .filter(i => i.text.trim())
        .map(i => `
          <tr>
            <td valign="top" style="padding:0 8px 0 0;width:12px;">
              <span style="color:#ffffff;font-size:18px;line-height:1.4;">&#8226;</span>
            </td>
            <td valign="top" style="padding:0 0 0 0;">
              <span style="color:#ffffff;font-size:15px;line-height:1.4;font-weight:400;font-family:'Inter',sans-serif;">${i.text}</span>
            </td>
          </tr>`).join('');
      return `
      <tr><td style="padding:0 40px 16px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="
          background:rgba(13,17,33,0.7);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:24px;
        ">
          <tr><td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle" style="padding-bottom:8px;">
                  ${getToggleSwitchIcon(cat.iconName, cat.customIconDataUrl)}
                  <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:1;vertical-align:top;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">${cat.name}</span>
                </td>
              </tr>
              <tr><td style="padding-left:${(cat.customIconDataUrl || (cat.iconName && featureIcons[cat.iconName])) ? '44px' : '0px'};">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${itemsHTML}
                </table>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>`;
    }).join('');

  const enhancementsRowsHTML = data.enhancements
    .filter(e => e.text.trim() && e.text.trim().toLowerCase() !== 'none')
    .map(e => {
      const iconName = e.iconName === undefined ? 'icon_04' : e.iconName;
      const iconSrc = iconName ? featureIcons[iconName] : undefined;
      return `
          <tr>
            <td valign="top" style="padding:0 12px 8px 0;width:32px;">
              ${iconSrc ? `<img src="${iconSrc}" height="32" alt="icon" style="display:inline-block;height:32px;width:auto;vertical-align:middle;border:0;">` : `<span style="color:rgba(255,255,255,0.7);font-size:15px;">&#9658;</span>`}
            </td>
            <td valign="middle" style="padding:0 0 8px 0;">
              <span style="font-size:15px;color:#cbd5e1;font-weight:400;font-family:'Inter',sans-serif;line-height:1.6;">${e.text}</span>
            </td>
          </tr>`;
    }).join('');

  const enhancementsHTML = enhancementsRowsHTML ? `
      <tr><td style="padding:12px 40px 28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="
          background:rgba(13,17,33,0.7);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:24px;
        ">
          <tr><td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${enhancementsRowsHTML}
            </table>
          </td></tr>
        </table>
      </td></tr>` : '';

  const demoButtonsHTML = data.demoButtons
    .filter(b => b.label.trim())
    .map(b => `<tr><td style="padding:10px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="border:2px solid #ffffff;border-radius:50px;text-align:center;background:rgba(255,255,255,0.06);">
          <a href="${b.buttonUrl || '#'}" style="display:block;padding:10px 16px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;">${b.label}</a>
        </td></tr>
      </table>
    </td></tr>`).join('');

  const highlightVideoBtn = data.highlightVideoUrl
    ? `<tr><td style="padding:16px 40px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border:2px solid #ffffff;border-radius:50px;text-align:center;background:rgba(255,255,255,0.06);"><a href="${data.highlightVideoUrl}" style="display:block;padding:10px 16px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;">&#127916; Watch the Video</a></td></tr></table></td></tr>`
    : '';

  const renderFixedImageRow = (src: string, alt: string): string =>
    `<tr><td align="center" width="100%" style="line-height:0;padding:0;width:100%;max-width:${mailWidth}px;"><img src="${src}" alt="${alt}" width="100%" style="display:block;width:100%;max-width:${mailWidth}px;height:auto;border:0;outline:none;text-decoration:none;margin:0;padding:0;-ms-interpolation-mode:bicubic;"></td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${product} ${version} Release</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#F0F1F5;" bgcolor="#F0F1F5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F0F1F5" style="background-color:#F0F1F5;padding:40px 0;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" align="center" bgcolor="#050a1f" style="background-color:#050a1f;width:100%;max-width:${mailWidth}px;margin:0 auto;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

  <!-- Top Branding Area -->
  <tr><td style="text-align:center;padding:40px 40px 0px;">
    <!-- Logo centered -->
    <div style="margin-bottom:0px;">
      ${logoElement}
    </div>
    <!-- Title and Tagline -->
    <div style="position:relative;z-index:20;">
      <h1 style="margin:0;font-size:48px;font-weight:800;color:#ffffff;letter-spacing:-0.04em;text-transform:uppercase;line-height:1.1;">
        ${product} <span style="color:#f59e0b;">${version}</span>
      </h1>
      <p style="margin:4px 0 0 0;font-size:18px;color:#cbd5e1;font-weight:400;">${tagline}</p>
    </div>
  </td></tr>

  <!-- Hero Image Area -->
  ${data.heroImageUrl ? renderFixedImageRow(data.heroImageUrl, 'Hero') : ''}


  <tr><td style="${innerBg}text-align:center;padding:8px 40px 16px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:${brand};letter-spacing:4px;text-transform:uppercase;">WHAT'S NEW</p>
    <h2 style="margin:8px 0 0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">Features</h2>
    <div style="height:2px;background:linear-gradient(90deg,transparent,${brand},transparent);border-radius:2px;margin-top:10px;"></div>
  </td></tr>

  ${categoriesHTML ? `<tr><td style="${innerBg}padding:4px 0 ;"><table width="100%" cellpadding="0" cellspacing="0">${categoriesHTML}</table></td></tr>` : ''}
  ${data.featuresImageUrl ? renderFixedImageRow(data.featuresImageUrl, 'Features Section Image') : ''}


  <tr><td style="${innerBg}text-align:center;padding:32px 40px 16px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:${brand};letter-spacing:4px;text-transform:uppercase;">HIGHLIGHTS</p>
    <h2 style="margin:10px 0 8px;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">${data.highlightTitle || 'NEW FEATURE HIGHLIGHTS'}</h2>
    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;font-weight:400;font-family:'Inter',sans-serif;">${(data.highlightDesc || '').replace(/\n/g, '<br>')}</p>
  </td></tr>
  ${data.highlightImageUrl ? renderFixedImageRow(data.highlightImageUrl, 'Highlight') : ''}
  ${highlightVideoBtn}

  ${enhancementsHTML ? `
  <tr><td style="${innerBg}padding:28px 40px 8px;text-align:center;">
    <p style="margin:0;font-size:11px;font-weight:700;color:${brand};letter-spacing:4px;text-transform:uppercase;">UPDATES</p>
    <h2 style="margin:8px 0 0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">Enhancements</h2>
  </td></tr>
  ${enhancementsHTML}` : ''}

  ${data.hostedEnvEnabled ? `
  <tr><td style="${innerBg}text-align:center;padding:36px 40px 20px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:${brand};letter-spacing:4px;text-transform:uppercase;">TRY IT NOW</p>
    <h2 style="margin:10px 0 12px;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">Hosted Environment</h2>
    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;font-weight:400;font-family:'Inter',sans-serif;">${data.hostedEnvDesc || ''}</p>
  </td></tr>
  ${data.hostedEnvImageUrl ? renderFixedImageRow(data.hostedEnvImageUrl, 'Hosted Env') : ''}
  <tr><td style="${innerBg}padding:20px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,17,33,0.7);">
      <tr><td style="padding:18px 20px;">
        ${data.hostedEnvUrl ? `<p style="margin:0 0 12px;text-align:center;font-size:15px;font-family:'Inter',sans-serif;"><span style="color:${brand};">URL: </span><a href="${data.hostedEnvUrl}" style="color:${brand};font-size:15px;text-decoration:none;">${data.hostedEnvUrl}</a></p>` : ''}
        ${data.adminUser ? `<p style="margin:8px 0;text-align:center;font-size:15px;color:#ffffff;font-family:'Inter',sans-serif;">Admin Account: UN: ${data.adminUser} | PW: ${data.adminPass}</p>` : ''}
        ${data.sysadminUser ? `<p style="margin:8px 0;text-align:center;font-size:15px;color:#ffffff;font-family:'Inter',sans-serif;">Sysadmin Account: UN: ${data.sysadminUser} | PW: ${data.sysadminPass}</p>` : ''}
        ${data.generalPass ? `<p style="margin:8px 0 0;text-align:center;font-size:15px;color:#ffffff;font-family:'Inter',sans-serif;">For any other user, use this password : PW: ${data.generalPass}</p>` : ''}
      </td></tr>
    </table>
  </td></tr>` : ''}

  ${data.demoTitle || data.demoButtons.some(b => b.label.trim()) || data.demoImageUrl ? `
  <tr><td style="${innerBg}text-align:center;padding:32px 40px 12px;">
    <h2 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;white-space:pre-line;font-family:'Inter',sans-serif;">${data.demoTitle || 'Stakeholder Demo\nVideo & Slide'}</h2>
  </td></tr>
  ${data.demoImageUrl ? renderFixedImageRow(data.demoImageUrl, 'Demo') : ''}
  <tr><td style="${innerBg}padding:8px 0 24px;"><table width="100%" cellpadding="0" cellspacing="0">${demoButtonsHTML}</table></td></tr>` : ''}

  <tr><td style="background:${footerBg};border-top:1px solid rgba(255,255,255,0.1);text-align:center;padding:22px 40px;">
    <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;">${data.footerText || 'Bring Innovation to Human Resource Management !!!'}</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}



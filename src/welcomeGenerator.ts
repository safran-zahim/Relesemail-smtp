import type { WelcomeFormData } from './types';

export function generateWelcomeEmailHTML(d: WelcomeFormData): string {
  const accent = d.accentColor || '#F35C17';
  const logoSrc = d.logoUrl && d.logoUrl.trim() 
    ? d.logoUrl 
    : '/orangehrm-logo.png';

  const logoImg = logoSrc
    ? `<img src="${logoSrc}" width="70" height="70" alt="Company Logo" style="width:70px;height:70px;margin:0 auto 20px auto;display:block;border:0;">`
    : `<div style="width:70px;height:70px;margin:0 auto 20px auto;border-radius:16px;background:${accent};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;text-align:center;line-height:70px;">${(d.companyName || 'C')[0]}</div>`;

  const photoImg = d.employeePhotoUrl
    ? `<img src="${d.employeePhotoUrl}" alt="${d.employeeName}" style="width:180px;height:180px;border-radius:50%;margin:0 auto 20px auto;object-fit:cover;display:block;border:8px solid #fff;box-shadow:0 4px 20px rgba(0,0,0,0.12);">`
    : `<div style="width:180px;height:180px;border-radius:50%;margin:0 auto 20px auto;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:700;color:#fff;border:8px solid #fff;box-shadow:0 4px 20px rgba(0,0,0,0.12);text-align:center;line-height:164px;">${(d.employeeName || 'E')[0]}</div>`;

  const qaRows = d.qaItems
    .filter(q => q.question.trim() && q.answer.trim())
    .map(q => `
      <p style="color:#2d3748;font-weight:700;margin:0 0 8px;font-size:14px;">${q.question}</p>
      <p style="color:#4a5568;margin:0 0 24px;font-size:14px;line-height:1.7;">${q.answer}</p>
    `).join('');

  const aboutHTML = d.about ? `
    <div style="margin-bottom:24px;">
      <h3 style="color:#2d3748;margin:0 0 12px;font-size:17px;font-weight:700;">👋 About ${d.employeeName?.split(' ')[0] || 'Them'}</h3>
      <p style="color:#4a5568;margin:0;font-size:14px;line-height:1.7;">${d.about}</p>
    </div>` : '';

  const educationHTML = d.education ? `
    <div style="margin-bottom:24px;">
      <h3 style="color:#2d3748;margin:0 0 12px;font-size:17px;font-weight:700;">🎓 Education</h3>
      <p style="color:#4a5568;margin:0;font-size:14px;line-height:1.7;">${d.education}</p>
    </div>` : '';

  const experienceHTML = d.experience ? `
    <div style="margin-bottom:24px;">
      <h3 style="color:#2d3748;margin:0 0 12px;font-size:17px;font-weight:700;">💼 Experience Highlights</h3>
      <p style="color:#4a5568;margin:0;font-size:14px;line-height:1.7;">${d.experience}</p>
    </div>` : '';

  const quoteHTML = d.welcomeQuote ? `
    <div style="margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:24px;border-radius:14px;text-align:center;box-shadow:0 8px 24px rgba(16,185,129,0.2);">
        <h3 style="color:#fff;margin:0 0 14px;font-size:19px;font-weight:700;">Please join us in giving ${d.employeeName?.split(' ')[0] || 'them'} a warm welcome!</h3>
        <p style="color:#fff;margin:0;font-size:15px;line-height:1.7;font-style:italic;">"${d.welcomeQuote}"</p>
        ${d.welcomeClosing ? `<p style="color:#fff;margin:14px 0 0;font-size:15px;">${d.welcomeClosing}</p>` : ''}
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome ${d.employeeName || 'to Our Team'}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4f4f4;">
  <tr><td style="padding:40px 20px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);overflow:hidden;">

      <!-- Logo + Headline -->
      <tr><td style="padding:36px 36px 16px;text-align:center;">
        ${logoImg}
        <h1 style="color:#2d3748;margin:0;font-size:36px;font-weight:800;line-height:1.2;">${d.headline || "You're Part of The Family Now"}</h1>
      </td></tr>

      <!-- Photo + Name -->
      <tr><td style="padding:16px 36px 8px;text-align:center;">
        ${photoImg}
        <h2 style="color:#2d3748;margin:0;font-size:26px;font-weight:700;">${d.employeeName || 'New Team Member'}</h2>
        <p style="color:${accent};margin:6px 0 2px;font-size:15px;font-weight:600;">${d.jobTitle || ''}</p>
        ${d.employeeEmail ? `<p style="color:#4a5568;margin:4px 0;font-size:13px;"><a href="mailto:${d.employeeEmail}" style="color:#4a5568;text-decoration:none;">${d.employeeEmail}</a></p>` : ''}
      </td></tr>

      <!-- Body Content -->
      <tr><td style="padding:8px 36px 40px;">
        <hr style="border:none;height:1px;background:#e2e8f0;margin:16px 0 24px;">
        <div style="padding:24px;background:linear-gradient(135deg,#f8fafc 0%,#eef2f7 100%);border-radius:14px;border:1px solid #e2e8f0;">
          ${aboutHTML}
          ${educationHTML}
          ${experienceHTML}
          ${quoteHTML}
          ${qaRows ? `<h3 style="color:#2d3748;margin:0 0 20px;font-size:19px;font-weight:700;">Get to Know the Person Behind the Passion</h3>${qaRows}` : ''}
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// Sends the astral chart by email via Resend (https://resend.com). Configure with:
//   RESEND_API_KEY      - API key from the Resend dashboard
//   RESEND_FROM_EMAIL   - verified sender, e.g. 'Método MAJHO <carta-astral@majhogroup.com>'
// If RESEND_API_KEY is not set, sending is skipped (logged) instead of failing the request —
// chart creation must never depend on email delivery succeeding.
async function sendAstralChartEmail({ to, name, chart }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Método MAJHO <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('[mailer] RESEND_API_KEY no configurada — se omite el envío del correo de carta astral.');
    return { sent: false, reason: 'missing_api_key' };
  }
  if (!chart) return { sent: false, reason: 'no_chart' };
  if (!to) return { sent: false, reason: 'no_recipient' };

  const row = (label, sign) => sign ? `
    <td style="background:#ffffff; border-radius:12px; padding:16px; text-align:center; width:33%;">
      <p style="font-size:28px; margin:0;">${sign.emoji}</p>
      <p style="font-size:11px; color:#9a9a9a; margin:6px 0 2px; text-transform:uppercase; letter-spacing:0.05em;">${label}</p>
      <p style="font-weight:bold; color:#2D2D2D; margin:0; font-family:Georgia,serif;">${sign.sign}</p>
    </td>` : '';

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; background: #F5EFE0; padding: 32px; border-radius: 16px;">
      <p style="font-size: 40px; text-align:center; margin:0 0 8px;">✨</p>
      <h1 style="color:#2D2D2D; text-align:center; font-size:22px; margin:0 0 4px;">Tu Carta Astral${name ? `, ${name}` : ''}</h1>
      <p style="color:#5C8A6E; text-align:center; font-size:13px; margin:0 0 24px;">Método MAJHO · Crianza Consciente Espiritual</p>
      <table style="width:100%; border-spacing:8px; border-collapse:separate;">
        <tr>
          ${row('Signo Solar', chart.solar)}
          ${row('Luna', chart.lunar)}
          ${row('Ascendente', chart.ascendant)}
        </tr>
      </table>
      <p style="color:#666; font-size:13px; text-align:center; margin-top:24px; line-height:1.5;">
        También puedes ver esta carta dentro de tu módulo en la app, en la pestaña "🔮 Carta Astral".
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: 'Tu Carta Astral está lista ✨', html }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('[mailer] Resend respondió con error al enviar la carta astral:', res.status, data);
      return { sent: false, reason: 'resend_error', detail: data };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('[mailer] Fallo de red al enviar la carta astral:', err.message);
    return { sent: false, reason: 'network_error' };
  }
}

module.exports = { sendAstralChartEmail };

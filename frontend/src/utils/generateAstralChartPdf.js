import { jsPDF } from 'jspdf';

// jsPDF's built-in fonts (Times/Helvetica) don't have emoji glyphs, so this PDF
// uses plain text only — the emoji versions live in the in-app view and email.
export function downloadAstralChartPdf(chart, { name, isMother } = {}) {
  if (!chart) return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  doc.setFillColor('#F5EFE0');
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor('#2D2D2D');
  doc.text('Tu Carta Astral', centerX, 110, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(15);
  doc.setTextColor('#5C8A6E');
  doc.text(isMother ? `${name || 'Mamá'}, mamá` : `${name || ''}`, centerX, 138, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor('#7B5EA7');
  doc.text('Método MAJHO · Crianza Consciente Espiritual', centerX, 158, { align: 'center' });

  const sections = [
    { label: 'Signo Solar', data: chart.solar },
    { label: 'Luna', data: chart.lunar },
    { label: 'Ascendente', data: chart.ascendant },
  ].filter(s => s.data);

  const boxWidth = 420;
  const boxHeight = 72;
  const startX = centerX - boxWidth / 2;
  let y = 220;

  sections.forEach(s => {
    doc.setFillColor('#FFFFFF');
    doc.roundedRect(startX, y, boxWidth, boxHeight, 12, 12, 'F');
    doc.setDrawColor('#D9C9A8');
    doc.roundedRect(startX, y, boxWidth, boxHeight, 12, 12, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#9a9a9a');
    doc.text(s.label.toUpperCase(), startX + 28, y + 26);

    doc.setFont('times', 'bold');
    doc.setFontSize(19);
    doc.setTextColor('#2D2D2D');
    doc.text(s.data.sign + (s.data.element ? `  ·  ${s.data.element}` : ''), startX + 28, y + 52);

    y += boxHeight + 18;
  });

  if (!chart.ascendant) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#aaaaaa');
    doc.text('Agrega la hora de nacimiento en tu perfil para calcular el ascendente.', centerX, y + 4, { align: 'center' });
    y += 24;
  }

  doc.setFontSize(9);
  doc.setTextColor('#bbbbbb');
  doc.text('Generado en tu espacio del Método MAJHO', centerX, pageHeight - 60, { align: 'center' });

  const fileSlug = (name || 'majho').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
  doc.save(`carta-astral-${fileSlug}.pdf`);
}

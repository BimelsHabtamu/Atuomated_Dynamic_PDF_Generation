const PdfPrinter = require('pdfmake');
const crypto     = require('crypto');
const QRCode     = require('qrcode');
const fs         = require('fs');
const path       = require('path');

const vfsFonts = require('pdfmake/build/vfs_fonts');

const fonts = {
  Roboto: {
    normal:      Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Regular.ttf'],     'base64'),
    bold:        Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Medium.ttf'],      'base64'),
    italics:     Buffer.from(vfsFonts.pdfMake.vfs['Roboto-Italic.ttf'],      'base64'),
    bolditalics: Buffer.from(vfsFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'],'base64'),
  },
};

function renderTemplate(html, data) {
  let result = html || '';
  for (const [key, value] of Object.entries(data || {})) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  }
  return result;
}

function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function computeSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function computeHMAC(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

async function generatePDF(template, data, docUuid, verifyBaseUrl, outputDir) {
  const printer = new PdfPrinter(fonts);

  const bodyText   = htmlToText(renderTemplate(template.body_html   || '', data));
  const headerText = htmlToText(renderTemplate(template.header_html || '', data));
  const footerText = htmlToText(renderTemplate(template.footer_html || '', data));

  const verifyUrl  = `${verifyBaseUrl}/verify?id=${docUuid}`;
  const qrDataUrl  = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 });
  const qrBase64   = qrDataUrl.split(',')[1];

  const watermark  = template.watermark_text
    ? { text: template.watermark_text, color: '#cccccc', opacity: 0.3, bold: true, italics: true }
    : undefined;

  const docDefinition = {
    pageSize:    'A4',
    pageMargins: [40, 70, 40, 90],
    watermark,

    header: () => ({
      margin: [40, 15, 40, 0],
      columns: [
        { text: headerText || template.name, fontSize: 10, color: '#1e3a5f', bold: true },
        { text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), fontSize: 9, color: '#888888', alignment: 'right' },
      ],
    }),

    footer: (currentPage, pageCount) => ({
      margin: [40, 10, 40, 10],
      columns: [
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 340, y2: 0, lineWidth: 0.5, lineColor: '#dddddd' }], margin: [0, 0, 0, 5] },
            { text: `Doc ID: ${docUuid}`, fontSize: 7, color: '#555555' },
            { text: verifyUrl, fontSize: 7, color: '#3b82f6' },
            { text: `Page ${currentPage} of ${pageCount}`, fontSize: 7, color: '#888888', margin: [0, 2, 0, 0] },
          ],
          width: '*',
        },
        {
          image: `data:image/png;base64,${qrBase64}`,
          width: 55,
          alignment: 'right',
        },
      ],
    }),

    content: [
      { text: template.name, fontSize: 18, bold: true, color: '#1e3a5f', margin: [0, 0, 0, 4] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#3b82f6' }], margin: [0, 0, 0, 16] },
      { text: bodyText, fontSize: 11, lineHeight: 1.5, color: '#333333' },
      footerText
        ? { text: footerText, fontSize: 9, color: '#888888', margin: [0, 20, 0, 0], italics: true }
        : {},
    ],

    defaultStyle: { font: 'Roboto' },
  };

  const pdfDoc   = printer.createPdfKitDocument(docDefinition);
  const filePath = path.join(outputDir, `${docUuid}.pdf`);

  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfDoc.on('data',  c => chunks.push(c));
    pdfDoc.on('end',   () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(filePath, buffer);
      resolve({ filePath, hash: computeSHA256(buffer), buffer });
    });
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

module.exports = { generatePDF, computeSHA256, computeHMAC, renderTemplate };

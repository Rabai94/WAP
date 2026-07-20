export type CredentialPdfSkill = {
  name_en: string;
};

export type CredentialPdfData = {
  credentialNumber: string;
  courseEndDate: string | null;
  courseStartDate: string | null;
  courseTitle: string;
  durationUnit: string | null;
  durationValue: number | null;
  expiresAt: string | null;
  issuedAt: string;
  issuerName: string;
  participantName: string;
  skills: CredentialPdfSkill[];
  verificationUrl: string;
};

type PdfObject = string;

export function createCredentialPdf(data: CredentialPdfData) {
  const content = buildPageContent(data);
  const objects: PdfObject[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] "
      + "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> "
      + "/Contents 6 0 R /Annots [7 0 R] >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${asciiLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Annot /Subtype /Link /Rect [72 42 770 68] /Border [0 0 0] "
      + `/A << /S /URI /URI (${escapePdfText(data.verificationUrl)}) >> >>`,
  ];

  const header = "%PDF-1.4\n";
  let document = header;
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(asciiLength(document));
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = asciiLength(document);
  document += `xref\n0 ${objects.length + 1}\n`;
  document += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    document += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  document += `startxref\n${xrefOffset}\n%%EOF\n`;

  return new TextEncoder().encode(document);
}

function buildPageContent(data: CredentialPdfData) {
  const commands: string[] = [
    "q",
    "0.08 0.36 1 rg",
    "0 0 842 16 re f",
    "0.93 0.96 1 rg",
    "25 25 792 545 re f",
    "1 1 1 rg",
    "42 42 758 511 re f",
    "0.08 0.36 1 RG",
    "2 w",
    "42 42 758 511 re S",
    "Q",
  ];

  addText(commands, "RabAI", 58, 515, 20, true, "0.08 0.36 1");
  addText(commands, "CERTIFICATE OF COURSE COMPLETION", 421, 468, 26, true, "0.04 0.07 0.16", true);
  addText(commands, "This verifies that", 421, 425, 13, false, "0.35 0.40 0.52", true);
  addText(commands, data.participantName, 421, 386, 27, true, "0.08 0.18 0.45", true);
  addText(commands, "successfully completed", 421, 350, 13, false, "0.35 0.40 0.52", true);
  addText(commands, data.courseTitle, 421, 315, 22, true, "0.04 0.07 0.16", true);
  addText(commands, `Issued by ${data.issuerName}`, 421, 281, 13, false, "0.16 0.22 0.34", true);

  const courseDates = formatCourseDates(data.courseStartDate, data.courseEndDate);
  const duration = data.durationValue && data.durationUnit
    ? `${data.durationValue} ${data.durationUnit}`
    : null;
  const detailParts = [courseDates, duration].filter(Boolean);

  if (detailParts.length > 0) {
    addText(commands, detailParts.join("  |  "), 421, 253, 11, false, "0.35 0.40 0.52", true);
  }

  addText(commands, "Result: PASSED", 95, 215, 12, true, "0.03 0.47 0.32");
  addText(commands, `Credential: ${data.credentialNumber}`, 95, 190, 11, false, "0.16 0.22 0.34");
  addText(commands, `Issued: ${formatDate(data.issuedAt)}`, 95, 168, 11, false, "0.16 0.22 0.34");

  if (data.expiresAt) {
    addText(commands, `Expires: ${formatDate(data.expiresAt)}`, 95, 146, 11, false, "0.16 0.22 0.34");
  }

  const skillText = data.skills.length > 0
    ? data.skills.map((skill) => skill.name_en).join(" | ")
    : "No course skills recorded";
  const skillLines = wrapText(`Skills: ${skillText}`, 78).slice(0, 3);

  skillLines.forEach((line, index) => {
    addText(commands, line, 95, 115 - index * 16, 10, false, "0.16 0.22 0.34");
  });

  addText(commands, "Verify this credential:", 421, 87, 10, true, "0.35 0.40 0.52", true);
  addText(commands, data.verificationUrl, 421, 61, 9, false, "0.08 0.36 1", true);
  addText(commands, "Document status at issuance: VALID", 750, 520, 9, true, "0.03 0.47 0.32", true);

  return commands.join("\n");
}

function addText(
  commands: string[],
  value: string,
  x: number,
  y: number,
  size: number,
  bold: boolean,
  color: string,
  centered = false,
) {
  const safeValue = toPdfLatin(value);
  const estimatedWidth = safeValue.length * size * (bold ? 0.56 : 0.5);
  const resolvedX = centered ? Math.max(50, x - estimatedWidth / 2) : x;

  commands.push(
    "BT",
    `/${bold ? "F2" : "F1"} ${size} Tf`,
    `${color} rg`,
    `1 0 0 1 ${resolvedX.toFixed(2)} ${y.toFixed(2)} Tm`,
    `(${escapePdfText(safeValue)}) Tj`,
    "ET",
  );
}

function formatCourseDates(start: string | null, end: string | null) {
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  if (start) {
    return `Started ${formatDate(start)}`;
  }

  if (end) {
    return `Completed ${formatDate(end)}`;
  }

  return null;
}

function formatDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value.slice(0, 10) : new Date(timestamp).toISOString().slice(0, 10);
}

function wrapText(value: string, width: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= width) {
      line = candidate;
      return;
    }

    if (line) {
      lines.push(line);
    }
    line = word;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function toPdfLatin(value: string) {
  return value
    .replace(/ß/g, "ss")
    .replace(/[ȘŞ]/g, "S")
    .replace(/[șş]/g, "s")
    .replace(/[ȚŢ]/g, "T")
    .replace(/[țţ]/g, "t")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfText(value: string) {
  return toPdfLatin(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function asciiLength(value: string) {
  return new TextEncoder().encode(value).length;
}

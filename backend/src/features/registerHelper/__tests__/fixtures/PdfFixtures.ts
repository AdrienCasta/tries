export class PdfFixtures {
  static generateMinimalPdf(sizeInMb: number): File {
    const minimalPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000114 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
195
%%EOF
`;

    const targetSizeInBytes = sizeInMb * 1024 * 1024;
    const currentSize = minimalPdfContent.length;
    const paddingNeeded = targetSizeInBytes - currentSize;

    let padding = "";
    if (paddingNeeded > 0) {
      const paddingLine = "% Padding to reach target file size\n";
      const linesNeeded = Math.ceil(paddingNeeded / paddingLine.length);
      padding = paddingLine.repeat(linesNeeded);
      padding = padding.substring(0, paddingNeeded);
    }

    const pdfContent = minimalPdfContent + padding;
    const blob = new Blob([pdfContent], { type: "application/pdf" });

    return new File([blob], "credential.pdf", { type: "application/pdf" });
  }

  static aValidCredentialPdf(): File {
    return this.generateMinimalPdf(10);
  }
}

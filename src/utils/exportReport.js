import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const scale = 2;
    const dataUrl = await domtoimage.toPng(element, {
      bgcolor: '#ffffff',
      width: element.scrollWidth * scale,
      height: element.scrollHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: element.scrollWidth + 'px',
        height: element.scrollHeight + 'px',
      },
      filter: (node) => !node.getAttribute?.('data-exclude-pdf'),
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (pdfHeight <= pageHeight) {
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      let position = 0;
      let remaining = pdfHeight;
      while (remaining > 0) {
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        remaining -= pageHeight;
        position -= pageHeight;
        if (remaining > 0) pdf.addPage();
      }
    }

    pdf.save(`ICT-Pipeline-Report-${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Export Error:', error);
    alert('Export failed: ' + error.message);
  }
};
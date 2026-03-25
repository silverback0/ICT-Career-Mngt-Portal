import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // 1. Convert the entire element to a PNG Blob
    // This library handles oklch and SVGs significantly better
    const dataUrl = await domtoimage.toPng(element, {
      bgcolor: '#f8fafc',
      quality: 0.95,
      style: {
        'transform': 'scale(1)', // Ensure no weird scaling issues
      }
    });

    // 2. Create the PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    // 3. Calculate height to maintain aspect ratio
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ministry-Report-${new Date().toISOString().split('T')[0]}.pdf`);
      alert("✅ Report Exported Successfully!");
    };

  } catch (error) {
    console.error("Export Error:", error);
    alert("Export failed. Your browser might be blocking the image conversion.");
  }
};
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const s3 = require('../s3');

const uploadToS3 = (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: 'my-app-data-new',
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  return s3.upload(params).promise();
};

// Function to generate PDF and upload to S3
const generatePDF = async (supplier, jobId) => {
  const doc = new PDFDocument({ bufferPages: true });
  const buffers = [];

  // Capture PDF content as buffers (instead of writing to a file)
  doc.on('data', buffers.push.bind(buffers));

  // Add content to the document
  doc.text(`Country: ${supplier.Country}`);
  doc.text(`Company: ${supplier.Company}`);

  // Finalize the document
  doc.end();

  // // Define the file name for S3 (e.g., `jobId-supplier.pdf`)
  const fileName = `pdfs/${jobId}/${supplier.Company}.pdf`;

  // Upload the PDF buffer to S3
  try {
    const data = await uploadToS3(doc, fileName, 'application/pdf');
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
  }
};

// Function to generate Excel and upload to S3
const generateExcel = async (supplier, jobId) => {
  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheetData = [
    ['Company', 'Country'], // Header row
    [supplier.Company, supplier.Country], // Data row
  ];

  // Convert data to worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

  // Write the workbook to a buffer
  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  // Define the file name for S3 (e.g., `jobId-supplier.xlsx`)
  const fileName = `excels/${jobId}-${supplier.Company}.xlsx`;

  // Upload the Excel buffer to S3
  try {
    const data = await uploadToS3(
      fileBuffer,
      fileName,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
  }
};
module.exports = { uploadToS3, generatePDF, generateExcel };

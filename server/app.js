const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
// const client = require('./db'); // Import the DB connection
const { generatePDF, generateExcel } = require('./helpers');
const data = require('./data/trueSightData.json');
const sessionData = require('./data/sessionInfo.json');
const review = require('./data/review.json');
const dummy = require('./data/dummy.json');

const app = express();
app.use(express.json()); // To parse JSON bodies

// Enable CORS for all routes
app.use(cors());

app.get('/', (req, res) => {
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      res.status(500).send('Database query error');
    } else {
      res.send('Current time from DB: ' + result.rows[0].now);
    }
  });
});

app.get('/rates', (_req, res, _next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive', // allowing TCP connection to remain open for multiple HTTP requests/responses
    'Content-Type': 'text/event-stream', // media type for Server Sent Events (SSE)
  });
  res.flushHeaders();

  const interval = setInterval(() => {
    const stock1Rate = Math.floor(Math.random() * 100000);
    const stock2Rate = Math.floor(Math.random() * 60000);
    res.write(`data: ${JSON.stringify({ stock1Rate, stock2Rate })}\n\n`);
  }, 1000);

  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/', // Temporary folder for uploads
});

app.post('/run-supplier-name-validation', async (req, res) => {
  const { session_id } = req.body;

  // Simulate an asynchronous operation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  res.json({ valid: true, session_id });
});

app.post('/status/session-status', async (req, res) => {
  const { session_id } = req.body;

  // Simulate an asynchronous operation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  res.json({
    session_id,
    overall_status: 'IN_PROGRESS',
    list_upload_status: 'COMPLETED',
    supplier_name_validation_status: 'COMPLETED',
    screening_analysis_status: 'NOT_STARTED',
    update_time: '2025-02-05T10:39:56.264156+00:00',
  });
});

// API endpoint to upload and process the Excel file
app.post('/upload-excel', upload.single('file'), (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, req.file.path); // Path to uploaded file

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(filePath);

    // Extract data from the first sheet
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

    // Delete the file after processing to save disk space
    fs.unlinkSync(filePath);

    // Send the data as the response
    res.json({
      message: 'Excel file processed successfully',
      data: sheetData,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process the Excel file',
      details: error.message,
    });
  }
});

// Create user
app.post('/users', async (req, res) => {
  const { username } = req.body;
  const query = 'INSERT INTO users (username) VALUES ($1) RETURNING *';
  const values = [username];

  try {
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// SSE: Start Process Endpoint
app.get('/status/ensid-status', async (req, res) => {
  try {
    const ensId = req.query.ens_id;

    console.log({ ensId });
    // const ensIdList = JSON.parse(req.query.ens_id_list || '[]');

    // console.log({ ensIdList });

    // if (!Array.isArray(ensIdList) || ensIdList.length === 0) {
    //   return res.status(400).json({ error: 'Invalid or missing ens_id_list' });
    // }

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });
    res.flushHeaders();

    // Function to send SSE updates
    const sendSSE = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // random delay
    const delay = Math.floor(Math.random() * 5000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const data = dummy.find((d) => d.ens_id === ensId);

    sendSSE({ ...data, overall_status: 'COMPLETED' });

    // let index = 0;

    // // Function to send SSE data with delay
    // const sendNext = () => {
    //   if (index >= ensIdList.length) {
    //     res.end(); // Close connection when done
    //     return;
    //   }

    //   const ensId = ensIdList[index++];
    //   console.log({ ensId });
    //   const data = dummy.find((d) => d.ens_id === ensId);

    //   sendSSE({ ...data, overall_status: 'COMPLETED' });

    //   // Send the next update after 2 seconds
    //   setTimeout(sendNext, 2000);
    // };

    // sendNext();

    // Handle client disconnect
    req.on('close', () => {
      console.log('Client disconnected from SSE');
      res.end();
    });
  } catch (error) {
    console.error('SSE error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Pagination route
app.get('/track-progress', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert query parameters to numbers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Validate inputs
  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return res.status(400).json({ error: 'Invalid page or limit' });
  }

  // Calculate start and end indices
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;

  // Paginated data
  const paginatedData = data.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    pdfLink:
      index % 4 !== 0
        ? 'https://my-app-data-new.s3.ap-south-1.amazonaws.com/pdfs/1736923186163_pjgs08bi/lonza+ltd.pdf'
        : null, // Random progress percentage
    wordLink:
      index % 4 !== 0
        ? 'https://my-app-data-new.s3.ap-south-1.amazonaws.com/pdfs/1736923186163_pjgs08bi/Sample+word+file.docx'
        : null, // Random progress percentage
  }));

  // Metadata
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Response
  res.json({
    currentPage: pageNumber,
    totalPages,
    totalItems,
    data: paginatedData,
  });
});

// Pagination route
app.get('/session-info', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert query parameters to numbers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Validate inputs
  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return res.status(400).json({ error: 'Invalid page or limit' });
  }

  // Calculate start and end indices
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;

  const allSessionData = sessionData.map((item) => {
    return {
      ...item,
      status: Math.random() > 0.5 ? 'Completed' : 'In-Progress',
    };
  });

  // Paginated data
  const paginatedData = allSessionData.slice(startIndex, endIndex);

  // Metadata
  const totalItems = allSessionData.length;
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Response
  res.json({
    currentPage: pageNumber,
    totalPages,
    totalItems,
    data: paginatedData,
  });
});

// Pagination route
app.get('/supplier/get-main-supplier-data', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert query parameters to numbers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Validate inputs
  if (isNaN(pageNumber) || isNaN(limitNumber)) {
    return res.status(400).json({ error: 'Invalid page or limit' });
  }

  // Calculate start and end indices
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;

  // Paginated data
  const paginatedData = dummy.slice(startIndex, endIndex);

  // Metadata
  const totalItems = dummy.length;
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Response
  res.json({
    currentPage: pageNumber,
    totalPages,
    totalItems,
    data: { data: paginatedData, total_data: totalItems },
    total_data: totalItems,
  });
});

// Pagination route
app.get('/orbis-data', async (req, res) => {
  const { page = 1, limit = 10, showSuggestions = 'false' } = req.query;

  // keep some delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Convert query parameters to numbers
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // Validate inputs
  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1
  ) {
    return res
      .status(400)
      .json({ error: 'Invalid page or limit. Must be positive integers.' });
  }

  const allData = data.map((item) => {
    const { match_found } = item;

    if (match_found) {
      return {
        ...item,
        suggested_name: '',
        suggested_city: '',
        suggested_country: '',
        suggested_email_or_website: '',
        suggested_phone_or_fax: '',
        suggested_national_id: '',
        suggested_postcode: '',
        suggested_state: '',
      };
    } else {
      return { ...item, suggested_name: item.name + ' LLC' };
    }
  });

  // Filter data based on showSuggestions
  const filteredData =
    showSuggestions === 'true'
      ? allData.filter((item) => !item.match_found)
      : allData;

  // Paginate data
  const startIndex = (pageNumber - 1) * limitNumber;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + limitNumber,
  );

  // Metadata
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Response
  res.json({
    currentPage: pageNumber,
    totalPages,
    totalItems,
    data: paginatedData,
  });
});

app.listen(4001, 'localhost', () => {
  console.log('Server is up and running at port 4001');
});

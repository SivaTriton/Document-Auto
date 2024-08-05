const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
app.use(express.json());
app.use(express.static('public'));

const extractFields = (text) => {
  const fields = {};
  const namePattern = /Name:\s*(.*)/i;
  const docNoPattern = /Document No:\s*(\S+)/i;
  const certNoPattern = /Certificate No:\s*(\S+)/i;
  const panNoPattern = /PAN No:\s*(\S+)/i;
  const addressPattern = /Address:\s*([\s\S]*?)\s*(Mobile No|Email)/i;
  const mobilePattern = /Mobile No:\s*(\S+)/i;
  const emailPattern = /Email:\s*(\S+)/i;

  fields.name = (text.match(namePattern) || [])[1] || '';
  fields.documentNo = (text.match(docNoPattern) || [])[1] || '';
  fields.certificateNo = (text.match(certNoPattern) || [])[1] || '';
  fields.panNo = (text.match(panNoPattern) || [])[1] || '';
  fields.address = (text.match(addressPattern) || [])[1] || '';
  fields.mobileNo = (text.match(mobilePattern) || [])[1] || '';
  fields.email = (text.match(emailPattern) || [])[1] || '';

  return fields;
};

app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    fs.unlinkSync(filePath);
    const extractedFields = extractFields(text);
    res.json({ extractedFields });
  } catch (error) {
    res.status(500).json({ error: 'Error processing document' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

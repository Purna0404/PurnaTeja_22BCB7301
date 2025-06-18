const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



// Create app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/LibraryDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Schemas
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  isbn: String,
  copiesAvailable: Number,
});

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  membershipDate: Date,
});

const issueLogSchema = new mongoose.Schema({
  memberId: mongoose.Schema.Types.ObjectId,
  bookId: mongoose.Schema.Types.ObjectId,
  issueDate: Date,
  returnDate: Date,
});

// Create Models
const Book = mongoose.model('Book', bookSchema);
const Member = mongoose.model('Member', memberSchema);
const IssueLog = mongoose.model('IssueLog', issueLogSchema);

// ---------------------- BOOK ROUTES ----------------------

// Get all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new book
app.post('/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    const saved = await book.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a book by ID
app.put('/books/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------- MEMBER ROUTES ----------------------

// Get all members
app.get('/members', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new member
app.post('/members', async (req, res) => {
  try {
    const member = new Member(req.body);
    const saved = await member.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a member by ID
app.put('/members/:id', async (req, res) => {
  try {
    const updated = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a member by ID
app.delete('/members/:id', async (req, res) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------------- ISSUE LOG ROUTES ----------------------

// Get all issue logs
app.get('/issues', async (req, res) => {
  try {
    const logs = await IssueLog.find().populate('memberId').populate('bookId');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Issue a new book
app.post('/issues', async (req, res) => {
  try {
    const { memberId, bookId } = req.body;

    const book = await Book.findById(bookId);
console.log("Fetched Book:", book);

if (!book || book.copiesAvailable <= 0) {
  return res.status(400).json({ error: "Book not available" });
}

    // Decrease available copies of the book
   
    book.copiesAvailable -= 1;
    await book.save();

    const log = new IssueLog({
      memberId,
      bookId,
      issueDate: new Date(),
      returnDate: null
    });
    const saved = await log.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Return a book (update returnDate and increase copies)
app.put('/issues/return/:id', async (req, res) => {
  try {
    const issue = await IssueLog.findById(req.params.id);
    if (!issue || issue.returnDate) {
      return res.status(400).json({ error: "Invalid issue record" });
    }

    issue.returnDate = new Date();
    await issue.save();

    // Increase available copies of the book
    const book = await Book.findById(issue.bookId);
    book.copiesAvailable += 1;
    await book.save();

    res.json(issue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Export models (optional for use in other files)
module.exports = { Book, Member, IssueLog };
app.get('/test-book/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Start server
app.listen(3000, () => console.log('Server running on port 3000'));

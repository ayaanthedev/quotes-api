const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors());

const quotesFilePath = path.join(__dirname, 'quotes.json');

// Create an empty quotes array if the file doesn't exist
fs.access(quotesFilePath)
  .catch(() => fs.writeFile(quotesFilePath, '[]'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Welcome to the Quote API!');
});

app.get('/quote', async (req, res) => {
  try {
    // Read the quotes from the JSON file
    const data = await fs.readFile(quotesFilePath, 'utf8');
    const quotes = JSON.parse(data);

    // Select a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Return the quote as a JSON response
    res.json(randomQuote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch a quote.' });
  }
});

app.post('/quote', async (req, res) => {
  try {
    // Extract the quote and author from the request body
    const { quote, author } = req.body;

    // Read the existing quotes from the JSON file
    const data = await fs.readFile(quotesFilePath, 'utf8');
    const quotes = JSON.parse(data);

    // Create a new quote object
    const newQuote = { quote, author };

    // Add the new quote to the quotes array
    quotes.push(newQuote);

    // Write the updated quotes array back to the JSON file
    await fs.writeFile(quotesFilePath, JSON.stringify(quotes));

    // Return the new quote as a JSON response
    res.json(newQuote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add the quote.' });
  }
});

const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Custom message for inspecting
server.on('listening', () => {
  console.log('Thanks for using this API');
});
app.get('/quoteoftheday', async (req, res) => {
  try {
    const data = await fs.readFile(quotesFilePath, 'utf8');
    const quotes = JSON.parse(data);

    if (!quotes.length) {
      return res.status(404).json({ error: 'No quotes available.' });
    }

    // Get today's date as a stable seed (e.g., "2025-05-30")
    const today = new Date().toISOString().slice(0, 10);

    // Simple deterministic hash function to get an index
    const hash = [...today].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = hash % quotes.length;

    const quoteOfTheDay = quotes[index];

    res.json(quoteOfTheDay);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch quote of the day.' });
  }
});
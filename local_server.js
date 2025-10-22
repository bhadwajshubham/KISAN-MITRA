const express = require('express');
const path = require('path');
const apiApp = require('./functions/express_app'); // Import the shared Express app

const app = express();
const port = 3000;

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the API application logic.
// The body-parser is already configured within apiApp.
app.use('/', apiApp);

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running!`);
  console.log(`You can view your application at: http://localhost:${port}`);
});

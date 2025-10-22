const express = require('express');
const path = require('path');
const apiApp = require('./functions/api_app'); // Import the shared app logic

const app = express();
const port = 3000;

// The express.json middleware needs to be applied to the main app
// before the apiApp is used, so it can parse the request body.
app.use(express.json({ limit: '10mb' }));

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the entire API application logic under the same path structure
app.use('/', apiApp);

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running!`);
  console.log(`You can view your application at: http://localhost:${port}`);
});

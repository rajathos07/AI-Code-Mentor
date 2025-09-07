require('dotenv').config(); // Load .env variables
const app = require("./src/app.js"); // Your Express app

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/database.js';

// Set NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB(); // ✅ MUST succeed
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1); // ✅ kill process if DB fails
  }
};

startServer();

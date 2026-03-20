import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.route.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Basic route for testing
app.get('/', (req, res) => {
    res.status(201).json({ message: 'Welcome to Perplexity API' });
});

// Routes will be added here
// import routes from './routes/index.js'
// app.use('/api', routes);
app.use("/api/auth", authRouter)


export default app;

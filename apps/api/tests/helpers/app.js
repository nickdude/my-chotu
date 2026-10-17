/**
 * Builds the Express app for integration tests without starting a server.
 * Each test file requires this instead of spinning up a real port.
 */
require('dotenv').config({ path: '.env.test' });

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const cookieParser = require('cookie-parser');

const requestId   = require('../../src/middleware/requestId');
const errorHandler = require('../../src/middleware/errorHandler');
const v1Routes    = require('../../src/routes/v1');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestId);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/v1', v1Routes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use(errorHandler);

module.exports = app;

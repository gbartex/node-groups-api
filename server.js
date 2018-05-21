require('./config/config');
// Modules
const { mongoose } = require('./db/mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load routes
const user = require('./routes/user');
const group = require('./routes/group');

// App
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Set port
const port = process.env.PORT || '8080';
app.set('port', port);

// Use Routes

app.use('/api', user);
app.use('/api', group);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));
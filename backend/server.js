const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidate', require('./routes/candidate'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/jobs', require('./routes/jobs'));
// Connect DB & start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
    // Seed admin if not exists
    require('./utils/seedAdmin')();
  })
  .catch(err => console.error('DB Error:', err));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const customerRoutes = require('./routes/customerRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1. CORS Configuration (403 Error එක විසඳීමට මෙය මෙසේ වෙනස් කරන්න)
app.use(cors()); 

// 2. Body Parser
app.use(express.json()); 

// 3. මූලික Route එකක් (Server එක වැඩදැයි Browser එකෙන් බැලීමට)
app.get('/', (req, res) => {
    res.send("Server is working perfectly!");
});

// 4. Routes 
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes)

// 5. Error Handling 
app.use(errorHandler);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const PORT = process.env.PORT || 5001;
// 'localhost' වෙනුවට '0.0.0.0' පාවිච්චි කරන්න ඕනේ
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
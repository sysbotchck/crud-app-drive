const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sysbotchck:sysbotchck@sysbotchck.ezxmpd8.mongodb.net/?appName=sysbotchck';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Item Schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    driveUrl: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', itemSchema);

// API Routes

// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
});

// GET single item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item', error: error.message });
    }
});

// POST create new item
app.post('/api/items', async (req, res) => {
    try {
        const { name, imageUrl, driveUrl } = req.body;

        if (!name || !imageUrl || !driveUrl) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newItem = new Item({
            name,
            imageUrl,
            driveUrl
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
});

// PUT update item
app.put('/api/items/:id', async (req, res) => {
    try {
        const { name, imageUrl, driveUrl } = req.body;

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            { name, imageUrl, driveUrl },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error: error.message });
    }
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

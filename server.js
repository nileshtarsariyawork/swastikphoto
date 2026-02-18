const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root

// Ensure upload directories exist
const uploadDirs = [
    path.join(__dirname, 'uploads', 'wedding'),
    path.join(__dirname, 'uploads', 'event'),
    path.join(__dirname, 'uploads', 'portrait'),
    path.join(__dirname, 'uploads', 'hero'),
    path.join(__dirname, 'uploads', 'about')
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Get category from body, default to 'other' if missing
        let category = req.body.category || 'other';

        // Ensure category folder exists inside uploads/
        const uploadPath = path.join(__dirname, 'uploads', category);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---

// 1. Login (Simple Hardcoded Auth)
app.post('/login', (req, res) => {
    const { password } = req.body;
    // HARDCODED PASSWORD: 'admin'
    if (password === 'admin') {
        res.json({ success: true, token: 'dummy-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// 2. Upload Image
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return relative path for frontend use
    // Return relative path for frontend use (remove leading slash if present)
    const relativePath = req.file.path.replace(__dirname, '').replace(/\\/g, '/').replace(/^\//, '');
    res.json({ success: true, filePath: relativePath, message: 'Image uploaded successfully!' });
});

// 3. Get Portfolio Images
app.get('/api/portfolio', (req, res) => {
    const portfolio = [];
    const baseUploads = path.join(__dirname, 'uploads');

    // Check for category filter in query params
    const filterCategory = req.query.category;
    let foldersToScan = [];

    if (filterCategory) {
        // If specific category requested, check if it exists
        const specificPath = path.join(baseUploads, filterCategory);
        if (fs.existsSync(specificPath) && fs.statSync(specificPath).isDirectory()) {
            foldersToScan.push(filterCategory);
        }
    } else {
        // Otherwise scan all directories
        if (fs.existsSync(baseUploads)) {
            foldersToScan = fs.readdirSync(baseUploads).filter(file => {
                return fs.statSync(path.join(baseUploads, file)).isDirectory();
            });
        }
    }

    foldersToScan.forEach(category => {
        const dirPath = path.join(baseUploads, category);
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            // Filter for image files only
            if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                portfolio.push({
                    category: category,
                    // Construct accessible URL path
                    src: `uploads/${category}/${file}`,
                    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Photo`,
                    desc: 'Swastik Photo',
                    timestamp: fs.statSync(path.join(dirPath, file)).mtimeMs // Add timestamp for sorting
                });
            }
        });
    });

    // Sort by newest first
    portfolio.sort((a, b) => b.timestamp - a.timestamp);

    res.json(portfolio);
});

// 4. Delete Image
app.delete('/api/image', (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        return res.status(400).json({ success: false, message: 'File path required' });
    }

    // Security: Ensure path is within 'uploads' directory
    const absolutePath = path.join(__dirname, filePath);
    const uploadsDir = path.join(__dirname, 'uploads');

    if (!absolutePath.startsWith(uploadsDir)) {
        return res.status(403).json({ success: false, message: 'Invalid file path' });
    }

    if (fs.existsSync(absolutePath)) {
        try {
            fs.unlinkSync(absolutePath);
            res.json({ success: true, message: 'Image deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to delete file' });
        }
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Route (Redirect)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`For admin panel, visit http://localhost:${PORT}/admin.html`);
});

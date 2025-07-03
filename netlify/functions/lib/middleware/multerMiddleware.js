import multer from 'multer';

// Use memory storage for compatibility with AWS S3
const storage = multer.memoryStorage();

// `upload` can be used as middleware in functions
const upload = multer({ storage });

export default upload;

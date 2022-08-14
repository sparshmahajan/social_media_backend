const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'webp' || extension === 'svg' || extension === "mp4") {
            cb(null, true);
        }
        else {
            cb(new Error('Only images and videos are allowed'), false);
        }
    }
});

module.exports = { upload };
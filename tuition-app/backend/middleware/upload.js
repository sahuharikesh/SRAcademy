const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Local disk storage, one subfolder per user: uploads/<userId>/logo.<ext>,
// uploads/<userId>/signature.<ext>. No S3/cloud bucket involved.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, String(req.currentUser._id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  // Fixed name per field (logo/signature) so re-uploads overwrite instead of
  // accumulating old files with different extensions.
  filename: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, String(req.currentUser._id));
    const ext = path.extname(file.originalname).toLowerCase();
    fs.readdirSync(dir)
      .filter((f) => f.startsWith(`${file.fieldname}.`))
      .forEach((f) => fs.unlinkSync(path.join(dir, f)));
    cb(null, `${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (png, jpg, jpeg, webp, svg) are allowed'));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

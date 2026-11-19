import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import multer from 'multer'
import config from '../config/index.js'
import { HttpError } from '../utils/httpError.js'
import { looksLikeImage } from '../utils/imageCheck.js'

const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

mkdirSync(config.uploadDir, { recursive: true })

// Files get a random name, so nobody can guess or overwrite someone else's photo
const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (req, file, done) => done(null, randomUUID() + EXTENSIONS[file.mimetype]),
})

const upload = multer({
  storage,
  limits: { fileSize: config.maxPhotoSizeMb * 1024 * 1024, files: config.maxPhotos },
  fileFilter: (req, file, done) => {
    if (EXTENSIONS[file.mimetype]) {
      done(null, true)
    } else {
      done(new HttpError(422, 'Photos must be JPG, PNG or WebP.'))
    }
  },
})

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `Each photo must be under ${config.maxPhotoSizeMb} MB.`,
  LIMIT_FILE_COUNT: `You can add up to ${config.maxPhotos} photos.`,
  LIMIT_UNEXPECTED_FILE: `Send photos in the "photos" field, up to ${config.maxPhotos}.`,
}

export async function removeUploadedFiles(files = []) {
  await Promise.all(files.map((file) => unlink(file.path).catch(() => {})))
}

// Reads up to maxPhotos files from the "photos" field of a multipart form into req.files.
// JSON requests pass straight through with req.files = [].
export function uploadPhotos(req, res, next) {
  upload.array('photos', config.maxPhotos)(req, res, async (error) => {
    req.files = req.files || []

    if (error) {
      await removeUploadedFiles(req.files)
      if (error instanceof multer.MulterError) {
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 422
        return next(new HttpError(status, MULTER_MESSAGES[error.code] || 'The photo upload failed.'))
      }
      return next(error)
    }

    for (const file of req.files) {
      if (!(await looksLikeImage(file.path, file.mimetype))) {
        await removeUploadedFiles(req.files)
        return next(new HttpError(422, `${file.originalname} is not a real image.`))
      }
    }

    next()
  })
}

// "/uploads/<file name>", what goes in item_images.image_url
export function publicUrl(file) {
  return `/uploads/${file.filename}`
}

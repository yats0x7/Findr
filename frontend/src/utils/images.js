// Photos live in localStorage (~5MB) until uploads exist (4.4), so we shrink
// them to 1280px max and save as jpeg. Usually ends up under 300KB.

export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PHOTO_SIZE_MB = 5
export const MAX_PHOTOS = 4

const MAX_SIDE = 1280

// returns an error message, or null if the file is ok
export function checkPhotoFile(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return `${file.name} is not a JPG, PNG or WebP image.`
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return `${file.name} is bigger than ${MAX_PHOTO_SIZE_MB} MB.`
  }
  return null
}

// returns a data url
export function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const context = canvas.getContext('2d')
      // white background for transparent pngs
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`${file.name} could not be opened as an image.`))
    }

    image.src = objectUrl
  })
}

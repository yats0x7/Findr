import { open } from 'node:fs/promises'

// The browser says what type a file is, but anyone can lie about that.
// Real images start with known bytes, so we check those too.
const SIGNATURES = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (bytes) => bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP',
}

export async function looksLikeImage(filePath, mimeType) {
  const matches = SIGNATURES[mimeType]
  if (!matches) {
    return false
  }

  const file = await open(filePath, 'r')
  try {
    const { buffer, bytesRead } = await file.read(Buffer.alloc(12), 0, 12, 0)
    return bytesRead >= 12 && matches(buffer)
  } finally {
    await file.close()
  }
}

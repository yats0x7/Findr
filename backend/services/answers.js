import bcrypt from 'bcryptjs'

// Answers to the finder's private question are stored hashed (bcrypt here,
// the schema suggests argon2id, both are fine). The plain answer is never kept.

// "  Monstera " and "monstera" should count as the same answer
export function normaliseAnswer(answer) {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function hashAnswer(answer) {
  return bcrypt.hash(normaliseAnswer(answer), 10)
}

export function checkAnswer(answer, hash) {
  return bcrypt.compare(normaliseAnswer(answer), hash)
}

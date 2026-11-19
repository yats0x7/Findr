import { findCategory } from '../models/referenceModel.js'
import { text } from './validators.js'

// Same rules and limits as the frontend form (frontend/src/utils/validateReport.js).
// Limits match the VARCHAR sizes in the schema.
export const LIMITS = {
  title: 160,
  description: 2000,
  location: 240,
  question: 200,
  answer: 100,
}

// today as YYYY-MM-DD in the server's time zone (toISOString would use UTC)
function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// title, category, description, date and place.
// Returns { values, fields } where fields has a message for each problem.
export function checkItemDetails(body) {
  const values = {
    title: text(body.title),
    category_id: text(body.category_id),
    description: text(body.description),
    event_date: text(body.event_date),
    location_label: text(body.location_label),
  }
  const fields = {}

  if (values.title.length < 3 || values.title.length > LIMITS.title) {
    fields.title = `Use 3 to ${LIMITS.title} characters.`
  }
  if (!findCategory(values.category_id)) {
    fields.category_id = 'Choose a category.'
  }
  if (values.description.length < 10 || values.description.length > LIMITS.description) {
    fields.description = `Use 10 to ${LIMITS.description} characters.`
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.event_date) || Number.isNaN(Date.parse(values.event_date))) {
    fields.event_date = 'Use a date like 2026-11-09.'
  } else if (values.event_date > today()) {
    fields.event_date = "The date can't be in the future."
  }
  if (!values.location_label || values.location_label.length > LIMITS.location) {
    fields.location_label = `Say where, up to ${LIMITS.location} characters.`
  }

  return { values, fields }
}

// Map pin: both numbers or neither, inside the real ranges (schema CHECK)
export function checkPin(latitude, longitude, fields) {
  const empty = (value) => value === undefined || value === null || value === ''
  if (empty(latitude) && empty(longitude)) {
    return { latitude: null, longitude: null }
  }

  const lat = Number(latitude)
  const lng = Number(longitude)
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    fields.latitude = 'The map pin is not a valid location.'
    return { latitude: null, longitude: null }
  }
  return { latitude: lat, longitude: lng }
}

// The private question for FOUND reports
export function checkQuestion(body, fields) {
  const question = text(body.question_text)
  const answer = text(body.answer)

  if (question.length < 5 || question.length > LIMITS.question) {
    fields.question_text = 'Ask something only the owner would know.'
  }
  if (!answer || answer.length > LIMITS.answer) {
    fields.answer = `Add the answer, up to ${LIMITS.answer} characters.`
  } else if (answer.toLowerCase() === question.toLowerCase()) {
    fields.answer = "The answer can't be the same as the question."
  }

  return { question, answer }
}

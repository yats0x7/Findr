import { todayAsDateInput } from './formatDate'

// Returns { field: message } for each problem, {} if the form is fine.
// title and location limits match the VARCHAR sizes in the schema.
export const LIMITS = {
  title: 160,
  description: 2000,
  location: 240,
  question: 200,
  answer: 100,
}

export function validateReport(form) {
  const errors = {}
  const title = form.title.trim()
  const description = form.description.trim()
  const location = form.location_label.trim()

  if (!title) {
    errors.title = 'Give the item a short name, like "Blue water bottle".'
  } else if (title.length < 3) {
    errors.title = 'Use at least 3 characters.'
  } else if (title.length > LIMITS.title) {
    errors.title = `Keep it under ${LIMITS.title} characters.`
  }

  if (!form.category_id) {
    errors.category_id = 'Choose a category.'
  }

  if (!form.community_id) {
    errors.community_id = 'Choose the community where this happened.'
  }

  if (!description) {
    errors.description = 'Describe the item so people can recognise it.'
  } else if (description.length < 10) {
    errors.description = 'Add a little more detail (at least 10 characters).'
  } else if (description.length > LIMITS.description) {
    errors.description = `Keep it under ${LIMITS.description} characters.`
  }

  if (!form.event_date) {
    errors.event_date = 'Choose the date.'
  } else if (form.event_date > todayAsDateInput()) {
    errors.event_date = "The date can't be in the future."
  }

  if (!location) {
    errors.location_label = 'Say where, like "Main Cafeteria" or "Block B stairs".'
  } else if (location.length > LIMITS.location) {
    errors.location_label = `Keep it under ${LIMITS.location} characters.`
  }

  if (form.report_type === 'FOUND') {
    const question = form.question_text.trim()
    const answer = form.answer.trim()

    if (!question) {
      errors.question_text = 'Ask something only the owner would know.'
    } else if (question.length < 5) {
      errors.question_text = 'Write the question in full.'
    } else if (question.length > LIMITS.question) {
      errors.question_text = `Keep it under ${LIMITS.question} characters.`
    }

    if (!answer) {
      errors.answer = 'Add the answer, so Findr can check claims against it.'
    } else if (answer.length > LIMITS.answer) {
      errors.answer = `Keep it under ${LIMITS.answer} characters.`
    } else if (question && answer.toLowerCase() === question.toLowerCase()) {
      errors.answer = "The answer can't be the same as the question."
    }
  }

  return errors
}

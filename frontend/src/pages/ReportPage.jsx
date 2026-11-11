import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import LocationPicker from '../components/LocationPicker'
import { useAsync } from '../hooks/useAsync'
import { createItem, listItems } from '../services/itemService'
import { listCategories } from '../services/referenceService'
import { getCurrentUser } from '../services/userService'
import { todayAsDateInput } from '../utils/formatDate'
import { ALLOWED_PHOTO_TYPES, MAX_PHOTOS, MAX_PHOTO_SIZE_MB, checkPhotoFile, shrinkPhoto } from '../utils/images'
import { centreOf } from '../utils/map'
import { LIMITS, validateReport } from '../utils/validateReport'
import '../styles/pages/report.css'


const EMPTY_FORM = {
  title: '',
  category_id: '',
  community_id: '',
  description: '',
  event_date: '',
  location_label: '',
  question_text: '',
  answer: '',
}

// used to focus the first field with an error
const FIELD_ORDER = ['title', 'category_id', 'community_id', 'description', 'event_date', 'location_label', 'question_text', 'answer']

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <span className="field-error" id={id}>
      {message}
    </span>
  )
}

function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const formRef = useRef(null)

  const reportType = searchParams.get('type') === 'found' ? 'FOUND' : 'LOST'
  const isFound = reportType === 'FOUND'

  const [form, setForm] = useState(EMPTY_FORM)
  const [pin, setPin] = useState(null)
  const [photos, setPhotos] = useState([]) // [{ id, name, url }]
  const [photoError, setPhotoError] = useState('')
  const [isAddingPhotos, setIsAddingPhotos] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setup = useAsync(
    () => Promise.all([getCurrentUser(), listCategories(), listItems({ hasLocation: true })]),
    [],
  )
  const [user, categories, pinnedItems] = setup.data || [null, [], []]

  // auto-pick if the user is only in one community
  const userCommunities = user ? user.communities : []
  const communityId = form.community_id || (userCommunities.length === 1 ? userCommunities[0].community_id : '')

  const mapCentre = centreOf(pinnedItems.filter((item) => !communityId || item.community_id === communityId))

  function chooseType(type) {
    setSearchParams(type === 'FOUND' ? { type: 'found' } : { type: 'lost' }, { replace: true })
    setErrors({})
  }

  function updateField(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }))
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: undefined }))
    }
  }

  async function addPhotos(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = '' // lets you pick the same file again
    setPhotoError('')

    const spaceLeft = MAX_PHOTOS - photos.length
    if (files.length > spaceLeft) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`)
    }

    const problems = []
    const accepted = []
    for (const file of files.slice(0, spaceLeft)) {
      const problem = checkPhotoFile(file)
      if (problem) {
        problems.push(problem)
      } else {
        accepted.push(file)
      }
    }

    setIsAddingPhotos(true)
    const added = []
    for (const file of accepted) {
      try {
        added.push({ id: `${file.name}-${file.lastModified}-${Math.random()}`, name: file.name, url: await shrinkPhoto(file) })
      } catch (error) {
        problems.push(error.message)
      }
    }
    setIsAddingPhotos(false)

    setPhotos((previous) => [...previous, ...added].slice(0, MAX_PHOTOS))
    if (problems.length > 0) {
      setPhotoError(problems.join(' '))
    }
  }

  function removePhoto(photoId) {
    setPhotos((previous) => previous.filter((photo) => photo.id !== photoId))
    setPhotoError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const filledForm = { ...form, community_id: communityId, report_type: reportType }
    const foundErrors = validateReport(filledForm)
    setErrors(foundErrors)

    const firstProblem = FIELD_ORDER.find((name) => foundErrors[name])
    if (firstProblem) {
      formRef.current.querySelector(`[name="${firstProblem}"]`)?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const { item, photosSaved } = await createItem({
        ...filledForm,
        latitude: pin ? pin.latitude : null,
        longitude: pin ? pin.longitude : null,
        photos: photos.map((photo) => photo.url),
        question_text: isFound ? form.question_text : '',
        answer: isFound ? form.answer : '',
      })
      navigate(`/items/${item.item_id}`, { state: { justReported: true, photosSaved } })
    } catch (error) {
      setSubmitError(error.message)
      setIsSubmitting(false)
    }
  }

  function errorProps(name) {
    return errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {}
  }

  if (setup.error) {
    return (
      <div className="container report-page">
        <EmptyState title="Couldn't open the form" text="Something went wrong. Refresh the page to try again." />
      </div>
    )
  }

  if (setup.data && userCommunities.length === 0) {
    return (
      <div className="container report-page">
        <EmptyState
          title="Join a community first"
          text="You can report items once you are a member of a college, hostel or colony on Findr."
        >
          <Button to="/explore">Explore items</Button>
        </EmptyState>
      </div>
    )
  }

  const errorCount = Object.values(errors).filter(Boolean).length

  return (
    <div className="container report-page">
      <header className="report-header">
        <h1>{isFound ? 'Report a found item' : 'Report a lost item'}</h1>
        <p>
          {isFound
            ? 'Thanks for helping. Describe what you found and set a question only the owner can answer.'
            : 'Describe what you lost and where. Your report stays searchable until you close it.'}
        </p>
        {user && <p className="report-posting-as">Posting as {user.full_name} (demo account until login arrives)</p>}
      </header>

      <div className="report-type" role="radiogroup" aria-label="What happened?">
        <button
          type="button"
          role="radio"
          aria-checked={!isFound}
          className={`report-type-option is-lost ${!isFound ? 'is-selected' : ''}`}
          onClick={() => chooseType('LOST')}
        >
          <strong>I lost something</strong>
          <span>Ask the community to look out for it</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isFound}
          className={`report-type-option is-found ${isFound ? 'is-selected' : ''}`}
          onClick={() => chooseType('FOUND')}
        >
          <strong>I found something</strong>
          <span>Help the owner get it back</span>
        </button>
      </div>

      <form ref={formRef} className="report-form" onSubmit={handleSubmit} noValidate>
        {errorCount > 0 && (
          <div className="alert alert-error" role="alert">
            {errorCount === 1 ? 'One thing needs fixing' : `${errorCount} things need fixing`} before you can post.
          </div>
        )}

        {/* ---------- The item ---------- */}
        <section className="card report-section">
          <h2>The item</h2>

          <div className="field">
            <label className="field-label" htmlFor="title">
              What is it?
            </label>
            <input
              id="title"
              name="title"
              className="input"
              maxLength={LIMITS.title}
              placeholder="e.g. Blue steel water bottle"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              {...errorProps('title')}
            />
            <FieldError id="title-error" message={errors.title} />
          </div>

          <div className="report-row">
            <div className="field">
              <label className="field-label" htmlFor="category_id">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                className="input"
                value={form.category_id}
                onChange={(event) => updateField('category_id', event.target.value)}
                {...errorProps('category_id')}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <FieldError id="category_id-error" message={errors.category_id} />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="community_id">
                Community
              </label>
              <select
                id="community_id"
                name="community_id"
                className="input"
                value={communityId}
                onChange={(event) => updateField('community_id', event.target.value)}
                {...errorProps('community_id')}
              >
                {userCommunities.length !== 1 && <option value="">Choose a community</option>}
                {userCommunities.map((community) => (
                  <option key={community.community_id} value={community.community_id}>
                    {community.name}
                  </option>
                ))}
              </select>
              <span className="field-hint">Only communities you belong to.</span>
              <FieldError id="community_id-error" message={errors.community_id} />
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="input"
              rows={4}
              maxLength={LIMITS.description}
              placeholder={
                isFound
                  ? 'Colour, brand, size, anything that helps the owner recognise it. Leave out the detail your question asks about.'
                  : 'Colour, brand, size, stickers, what was inside. The more detail, the easier it is to spot.'
              }
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              {...errorProps('description')}
            />
            <FieldError id="description-error" message={errors.description} />
          </div>

          <div className="field">
            <span className="field-label" id="photos-label">
              Photos <span className="field-optional">(optional)</span>
            </span>
            <div className="photo-picker">
              {photos.map((photo) => (
                <div key={photo.id} className="photo-preview">
                  <img src={photo.url} alt={photo.name} />
                  <button type="button" className="photo-remove" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}>
                    ×
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="photo-add">
                  <input
                    type="file"
                    accept={ALLOWED_PHOTO_TYPES.join(',')}
                    multiple
                    onChange={addPhotos}
                    aria-labelledby="photos-label"
                    disabled={isAddingPhotos}
                  />
                  <span aria-hidden="true">+</span>
                  {isAddingPhotos ? 'Adding…' : 'Add photo'}
                </label>
              )}
            </div>
            <span className="field-hint">
              Up to {MAX_PHOTOS} JPG, PNG or WebP photos, {MAX_PHOTO_SIZE_MB} MB each.
              {isFound && " Don't show the detail your private question asks about."}
            </span>
            {photoError && <span className="field-error">{photoError}</span>}
          </div>
        </section>

        {/* ---------- When and where ---------- */}
        <section className="card report-section">
          <h2>When and where</h2>

          <div className="report-row">
            <div className="field">
              <label className="field-label" htmlFor="event_date">
                {isFound ? 'Date found' : 'Date lost'}
              </label>
              <input
                id="event_date"
                name="event_date"
                className="input"
                type="date"
                max={todayAsDateInput()}
                value={form.event_date}
                onChange={(event) => updateField('event_date', event.target.value)}
                {...errorProps('event_date')}
              />
              <FieldError id="event_date-error" message={errors.event_date} />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="location_label">
                Place
              </label>
              <input
                id="location_label"
                name="location_label"
                className="input"
                maxLength={LIMITS.location}
                placeholder="e.g. Central Library, 2nd floor"
                value={form.location_label}
                onChange={(event) => updateField('location_label', event.target.value)}
                {...errorProps('location_label')}
              />
              <FieldError id="location_label-error" message={errors.location_label} />
            </div>
          </div>

          <div className="field">
            <span className="field-label">
              Pin it on the map <span className="field-optional">(optional)</span>
            </span>
            <span className="field-hint">
              Tap the map where it was {isFound ? 'found' : 'lost'}. Drag the pin to move it. Pinned reports show on the Findr map.
            </span>
            {setup.data && <LocationPicker value={pin} onChange={setPin} centre={mapCentre} reportType={reportType} />}
            {pin && (
              <div className="report-pin-row">
                <span className="field-hint">
                  Pinned at {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
                </span>
                <Button variant="ghost" size="small" onClick={() => setPin(null)}>
                  Remove pin
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ---------- Private question (FOUND only) ---------- */}
        {isFound && (
          <section className="card report-section report-question">
            <h2>Private question</h2>
            <p className="report-section-intro">
              Anyone who claims this item has to answer your question. Ask about a detail that isn't in your description or
              photos, like a sticker, a name inside, or what's in a pocket.
            </p>

            <div className="field">
              <label className="field-label" htmlFor="question_text">
                Question
              </label>
              <input
                id="question_text"
                name="question_text"
                className="input"
                maxLength={LIMITS.question}
                placeholder="e.g. What sticker is on the bottle?"
                value={form.question_text}
                onChange={(event) => updateField('question_text', event.target.value)}
                {...errorProps('question_text')}
              />
              <FieldError id="question_text-error" message={errors.question_text} />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="answer">
                Answer
              </label>
              <input
                id="answer"
                name="answer"
                className="input"
                maxLength={LIMITS.answer}
                autoComplete="off"
                placeholder="e.g. A monstera leaf"
                value={form.answer}
                onChange={(event) => updateField('answer', event.target.value)}
                {...errorProps('answer')}
              />
              <span className="field-hint">
                Kept secret. Findr stores a scrambled (hashed) version and never shows the answer to anyone, including you.
                Capital letters don't matter.
              </span>
              <FieldError id="answer-error" message={errors.answer} />
            </div>
          </section>
        )}

        {submitError && (
          <div className="alert alert-error" role="alert">
            {submitError}
          </div>
        )}

        <div className="report-actions">
          <Button type="submit" variant={isFound ? 'found' : 'lost'} size="large" disabled={isSubmitting || isAddingPhotos || !setup.data}>
            {isSubmitting ? 'Posting…' : isFound ? 'Post found report' : 'Post lost report'}
          </Button>
          <Button to="/explore" variant="ghost">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ReportPage

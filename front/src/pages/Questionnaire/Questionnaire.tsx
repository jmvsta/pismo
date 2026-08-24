import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Questionnaire.css'

const SECTIONS = [
  'Free time',
  'Music & film',
  'Travelling',
  'Food & drink',
  'Reading & games',
  'Habits & views',
  'Communication',
  'Photo picks',
]

const FREE_TIME_OPTIONS = ['Outdoors', 'At home', 'With friends', 'Alone, thanks', 'Making things']
const HANDS_OPTIONS = ['Carpentry', 'Pottery', 'Bookbinding', 'Gardening', 'Baking']
const TEA_COFFEE_OPTIONS = ['Tea', 'Coffee', 'Both', 'Neither']
const CINEMA_OPTIONS = ['Popcorn', 'Nachos', 'Nothing', 'I sneak my own']
const COMMUNICATION_OPTIONS = [
  'Long, thoughtful letters — once a month is fine',
  'Regular shorter letters, every week or two',
  'Postcards and small notes, often',
]
const PHOTOS = ['photo A', 'photo B', 'photo C', 'photo D']

function toggleInSet(set: string[], value: string) {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value]
}

function Questionnaire() {
  const navigate = useNavigate()

  const [freeTime, setFreeTime] = useState<string[]>(['Outdoors', 'With friends'])
  const [teaCoffee, setTeaCoffee] = useState<string | null>(null)
  const [cinemaSnack, setCinemaSnack] = useState<string | null>(null)
  const [communication, setCommunication] = useState<string | null>(null)
  const [hands, setHands] = useState<string[]>(['Pottery'])
  const [photo, setPhoto] = useState('photo A')

  const finish = () => navigate('/')

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-card">
        <aside className="questionnaire-sidebar">
          <h6>Sections</h6>
          <nav className="questionnaire-sections">
            {SECTIONS.map((section, i) => (
              <span key={section} className={i === 0 ? 'is-current' : undefined}>
                {section}
              </span>
            ))}
          </nav>
          <div className="questionnaire-progress">
            <div className="questionnaire-progress-label">18 of 23 answered</div>
            <div className="questionnaire-progress-track">
              <div className="questionnaire-progress-fill" style={{ width: '78%' }} />
            </div>
          </div>
        </aside>

        <div className="questionnaire-body">
          <div>
            <h6>Questionnaire</h6>
            <h3>Tell us who you are</h3>
            <p className="text-muted questionnaire-intro">
              Your answers drive matching — the more honest, the better your pen pals.
            </p>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">01 — Free time is best spent</div>
            <div className="questionnaire-tags">
              {FREE_TIME_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tag tag-select ${freeTime.includes(option) ? 'tag-accent' : 'tag-neutral'}`}
                  onClick={() => setFreeTime((prev) => toggleInSet(prev, option))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">02 — Tea or coffee</div>
            <div className="seg">
              {TEA_COFFEE_OPTIONS.map((option) => (
                <label className="seg-opt" key={option}>
                  <input
                    type="radio"
                    name="tea-coffee"
                    checked={teaCoffee === option}
                    onChange={() => setTeaCoffee(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">03 — In cinema I eat</div>
            <div className="seg">
              {CINEMA_OPTIONS.map((option) => (
                <label className="seg-opt" key={option}>
                  <input
                    type="radio"
                    name="cinema"
                    checked={cinemaSnack === option}
                    onChange={() => setCinemaSnack(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">04 — Style of communication</div>
            <div className="questionnaire-radio-list">
              {COMMUNICATION_OPTIONS.map((option) => (
                <label className="radio" key={option}>
                  <input
                    type="radio"
                    name="communication"
                    checked={communication === option}
                    onChange={() => setCommunication(option)}
                  />
                  <span className="dot" />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">
              05 — If I could work with my hands, I would choose
            </div>
            <div className="questionnaire-tags">
              {HANDS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tag tag-select ${hands.includes(option) ? 'tag-accent' : 'tag-neutral'}`}
                  onClick={() => setHands((prev) => toggleInSet(prev, option))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="questionnaire-question">
            <div className="questionnaire-question-title">06 — Choose the photo you like most</div>
            <div className="questionnaire-photos">
              {PHOTOS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`photo-placeholder questionnaire-photo ${photo === label ? 'is-selected' : ''}`}
                  onClick={() => setPhoto(label)}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="questionnaire-actions">
            <button type="button" className="btn btn-primary" onClick={finish}>
              Save and continue →
            </button>
            <button type="button" className="btn btn-ghost" onClick={finish}>
              Finish later
            </button>
            <span className="text-muted questionnaire-more">…17 more questions below</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Questionnaire

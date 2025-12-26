import { useEffect, useState } from 'react'
import Form from './Form'
import CloseIcon from '../assets/XIcon.svg'
import '../styles/popup.css'

export default function GenericPopup ({ show, onClose, onSubmit, title, fields, initialData, buttonText }) {
  const [formData, setFormData] = useState(initialData || {})

  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData, show])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <div>
      {show && (
        <div className='bg'>
          <div className='popup'>
            <button className='close' onClick={onClose}>
              <img src={CloseIcon} alt='Close' />
            </button>
            <Form
              title={title}
              fields={fields}
              onSubmit={handleSubmit}
              buttonText={buttonText}
              initialData={formData}
            />
          </div>
        </div>
      )}
    </div>
  )
}

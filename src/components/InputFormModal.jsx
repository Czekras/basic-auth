import Modal from './Modal.jsx'
import InputForm from './InputForm.jsx'

export default function InputFormModal({
  title,
  subtitle,
  onClose,
  ...inputFormProps
}) {
  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <InputForm {...inputFormProps} />
    </Modal>
  )
}

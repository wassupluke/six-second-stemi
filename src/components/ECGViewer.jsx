export function ECGViewer({ ecg }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <img
        src={ecg.image}
        alt="12-lead ECG"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}

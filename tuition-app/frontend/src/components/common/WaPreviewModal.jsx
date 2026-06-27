import AppModal from './AppModal';
import { WhatsAppOutlined } from '@ant-design/icons';

export default function WaPreviewModal({ open, onClose, title, subtitle, message, qrUrl, amount, onSend }) {
  const handleSend = () => { onSend(); onClose(); };

  return (
    <AppModal open={open} onClose={onClose} title={title || 'WhatsApp Preview'} subtitle={subtitle}>
      <div className="px-5 py-4 flex flex-col gap-4">
        {qrUrl && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide self-start">UPI Payment QR — Scan to Pay</p>
            <img src={qrUrl} alt="UPI QR" className="w-40 h-40 rounded-xl"
              style={{ border: '2px solid #C9A84C' }} />
            {amount > 0 && (
              <div className="text-sm font-black" style={{ color: '#dc2626' }}>Rs. {amount}</div>
            )}
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Message Preview</p>
          <div className="rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap"
            style={{ background: '#DCF8C6', color: '#1a1a1a', border: '1px solid #b7e4a0',
              maxHeight: '220px', overflowY: 'auto', fontFamily: 'inherit' }}>
            {message}
          </div>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-3">
        <button onClick={onClose} className="flex-1 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: '#f3f4f6', color: '#666' }}>Cancel</button>
        <button onClick={handleSend}
          className="flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5"
          style={{ background: 'linear-gradient(135deg,#25D366,#1ead52)', color: '#fff' }}>
          <WhatsAppOutlined /> Send
        </button>
      </div>
    </AppModal>
  );
}

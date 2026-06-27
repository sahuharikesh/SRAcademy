import { Modal } from 'antd';

export default function AppModal({ open, onClose, title, subtitle, width = 400, destroyOnClose = false, children }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable={false}
      width={width}
      destroyOnHidden={destroyOnClose}
      styles={{ content: { border: '2px solid #C9A84C', padding: 0, borderRadius: 16, overflow: 'hidden' } }}
    >
      <div className="px-5 py-4 flex items-start justify-between"
        style={{ background: 'linear-gradient(135deg,#1a1a1a,#2a2a2a)', borderBottom: '2px solid #C9A84C' }}>
        <div>
          <h2 className="text-sm font-black text-white">{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: '#C9A84C' }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold leading-none">×</button>
      </div>
      {children}
    </Modal>
  );
}

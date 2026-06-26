export default function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: '#7a6020' }}>{label}</label>
      {children}
    </div>
  );
}

export const inp =
  'w-full border rounded-lg px-3 py-2 focus:outline-none text-sm bg-white text-gray-800'
  + ' border-gray-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-400';

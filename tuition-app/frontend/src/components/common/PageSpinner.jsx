export default function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--brand-gold, #C9A84C)', borderTopColor: 'transparent' }} />
    </div>
  );
}

export default function Avatar({ name = '', size = 'md', src }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-2 ring-white flex-shrink-0`}>
      <span className="font-bold text-white leading-none">{initials || 'U'}</span>
    </div>
  );
}

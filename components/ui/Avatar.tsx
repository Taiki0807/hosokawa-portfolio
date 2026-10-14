/* eslint-disable @next/next/no-img-element */
type Props = { name: string; image?: string | null; size?: number; className?: string }

export default function Avatar({ name, image, size = 32, className = '' }: Props) {
  const style = { width: size, height: size }
  if (image) {
    return (
      <img
        src={image}
        alt=""
        style={style}
        className={`flex-none rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: Math.round(size * 0.4) }}
      className={`from-brand-400 to-brand-700 text-ink-inverse-50 inline-flex flex-none items-center justify-center rounded-full bg-linear-135 font-black ${className}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}

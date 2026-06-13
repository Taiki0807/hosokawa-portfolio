type SetcionHeaderProps = {
  tag: string
  title: string
  description?: string
}

const SectionHeading = ({ tag, title, description }: SetcionHeaderProps) => {
  return (
    <div className="mb-10">
      <span className="mb-3 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-mono text-xs tracking-wide text-purple-600">
        {tag}
      </span>
      <h2 className="mb-1.5 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-md text-sm leading-relaxed text-gray-500">{description}</p>
      )}
    </div>
  )
}

export default SectionHeading

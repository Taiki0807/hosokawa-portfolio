import { profile } from '@/data'

const Hero = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_476px_at_54.8%_51.5%,rgba(168,229,253,1)_0%,rgba(224,244,254,1)_42.3%,rgba(244,244,254,1)_100.2%)]">
      <div className="relative z-10 text-center">
        <div className="sm:mb-6">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-600">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            {profile.status}
          </span>
        </div>
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          初めまして、
          <br />
          <span className="text-purple-600">{profile.name}</span>です
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
          {profile.bio}
        </p>
      </div>
    </div>
  )
}

export default Hero

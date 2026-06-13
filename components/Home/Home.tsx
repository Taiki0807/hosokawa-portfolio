import Hero from '@/components/Home/Hero/Hero'
import About from '@/components/About/About'
import Skill from '@/components/Skill/Skill'
import Certifications from '@/components/Certifications/Certifications'
import Project from '@/components/Project/Project'
import Blog from '@/components/Blog/Blog'
import Contact from '@/components/Contact/Contact'
import Footer from '@/components/Footer/Footer'

const Home = () => {
  return (
    <div className="overflow-hidden">
      <Hero />
      <About />
      <Skill />
      <Certifications />
      <Project />
      <Blog />
      <Contact />
      <Footer />
    </div>
  )
}

export default Home

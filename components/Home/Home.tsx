import Hero from '@/components/Home/Hero/Hero'
import About from '@/components/About/About'
import Skill from '@/components/Skill/Skill'
import Certifications from '@/components/Certifications/Certifications'
import Project from '@/components/Project/Project'
import Blog from '@/components/Blog/Blog'
import Contact from '@/components/Contact/Contact'
import ChatSection from '@/components/Chat/ChatSection'
import Footer from '@/components/Footer/Footer'
import LearningSection from '@/components/learning/LearningSection'
import GoalsSection from '@/components/goals/GoalsSection'
import ReviewSection from '@/components/review/ReviewSection'
import {
  getSkillsAndCertifications,
  toCertificationItems,
  toSkillItems,
} from '@/lib/skills/queries'
import { isLocalLlmEnabled } from '@/lib/local-llm/server'

const Home = async () => {
  const { skills, certifications } = await getSkillsAndCertifications()
  return (
    <div className="overflow-hidden">
      <Hero />
      <Skill skills={toSkillItems(skills)} />
      <About />
      <LearningSection goals={<GoalsSection />} />
      <ReviewSection />
      <Certifications certifications={toCertificationItems(certifications)} />
      <Project />
      <Blog />
      {/* ローカル LLM の URL が設定されているときだけ出す */}
      {isLocalLlmEnabled() ? <ChatSection /> : null}
      <Contact />
      <Footer />
    </div>
  )
}

export default Home

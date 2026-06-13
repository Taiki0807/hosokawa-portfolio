import SectionHeading from '../Helper/SectionHeading'
import { SkillCard } from './SkillCard'
import { skills } from '@/data'

const Skill = () => {
  return (
    <div className="bg-gray-100 py-16" id="skills">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading
          tag="// スキル"
          title="使える技術"
          description="フロントエンドからバックエンド、インフラまで幅広く対応できます。"
        />

        <div className="flex w-full justify-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {skills.map((skill) => (
              <SkillCard
                key={skill.name}
                icon={skill.icon}
                name={skill.name}
                description={skill.description}
                level={skill.level}
                hasExperience={skill.hasExperience}
                rating={skill.rating}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skill

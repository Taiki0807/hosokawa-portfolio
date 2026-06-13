import React from 'react'
import SectionHeading from '../Helper/SectionHeading'
import { about, profile } from '@/data'

const About = () => {
  return (
    <div className="bg-gray-100 py-16" id="about">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading tag="// About" title="自己紹介" description="開発者としての私について。" />

        <div className="grid w-full items-center gap-8 lg:grid-cols-2">
          {/* 左: コードエディタ風カード */}
          <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
            {/* ウィンドウバー */}
            <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 font-mono text-xs text-gray-400">profile.json</span>
            </div>

            {/* コード内容 */}
            <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
              <code>
                <span className="text-gray-500">{'{'}</span>
                {'\n'}
                {'  '}
                <span className="text-purple-400">&quot;name&quot;</span>:{' '}
                <span className="text-green-400">&quot;{profile.name}&quot;</span>,{'\n'}
                {'  '}
                <span className="text-purple-400">&quot;role&quot;</span>:{' '}
                <span className="text-green-400">&quot;{profile.role}&quot;</span>,{'\n'}
                {'  '}
                <span className="text-purple-400">&quot;location&quot;</span>:{' '}
                <span className="text-green-400">&quot;{profile.location}&quot;</span>,{'\n'}
                {'  '}
                <span className="text-purple-400">&quot;status&quot;</span>:{' '}
                <span className="text-green-400">&quot;available&quot;</span>,{'\n'}
                {'  '}
                <span className="text-purple-400">&quot;highlights&quot;</span>: [{'\n'}
                {about.highlights.map((h, i) => (
                  <React.Fragment key={h.label}>
                    {'    '}
                    <span className="text-green-400">
                      &quot;{h.icon} {h.label}&quot;
                    </span>
                    {i < about.highlights.length - 1 ? ',' : ''}
                    {'\n'}
                  </React.Fragment>
                ))}
                {'  '}]{'\n'}
                <span className="text-gray-500">{'}'}</span>
              </code>
            </pre>
          </div>

          {/* 右: テキスト + 統計 */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-gray-900">{about.heading}</h3>

            <div className="mb-8 space-y-3">
              {about.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-500">
                  {p}
                </p>
              ))}
            </div>

            {/* 統計 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {about.stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <div className="text-2xl font-black text-purple-600">{stat.number}</div>
                  <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

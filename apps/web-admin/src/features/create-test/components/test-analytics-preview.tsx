import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TestAnalyticsData {
  easy: number
  medium: number
  hard: number
  totalTime: number
  coverageScore: number
  predictedDifficulty: string
  total: number
}

interface TestQuestion {
  id: string
  question: string
  difficulty: string
  question_type: string
  points: number
  identifier: string
}

interface TestAnalyticsPreviewProps {
  data: TestAnalyticsData
  questions: TestQuestion[]
}

const DIFFICULTY_COLORS = ['#34d399', '#f59e0b', '#ef4444']
const COVERAGE_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#ef4444']
const COVERAGE_ITEMS = ['Easy', 'Medium', 'Hard', 'Mixed']

export function TestAnalyticsPreview({
  data,
  questions,
}: TestAnalyticsPreviewProps) {
  const difficultyData = [
    { name: 'Easy', count: data.easy },
    { name: 'Medium', count: data.medium },
    { name: 'Hard', count: data.hard },
  ]

  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1
    return acc
  }, {})

  const coverageData = COVERAGE_ITEMS.map((name) => ({
    name,
    value:
      name === 'Easy'
        ? data.easy
        : name === 'Medium'
          ? data.medium
          : name === 'Hard'
            ? data.hard
            : Math.max(0, 10 - data.easy - data.medium - data.hard),
  }))

  return (
    <section>
      <h2 className='mb-4 font-medium text-slate-300 text-sm uppercase tracking-wide'>
        Test Analytics Preview
      </h2>
      <div className='grid gap-5 md:grid-cols-4'>
        <div className='flex flex-col gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
          <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
            Total Questions
          </span>
          <span className='font-semibold text-2xl text-white tabular-nums'>
            {data.total}
          </span>
        </div>
        <div className='flex flex-col gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
          <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
            Est. Time
          </span>
          <span className='font-semibold text-2xl text-white tabular-nums'>
            {data.totalTime}m
          </span>
        </div>
        <div className='flex flex-col gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
          <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
            Coverage Score
          </span>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-2xl text-white tabular-nums'>
              {data.coverageScore}%
            </span>
            <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all'
                style={{ width: `${data.coverageScore}%` }}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'>
          <span className='text-[0.6rem] text-slate-500 uppercase tracking-wider'>
            Predicted Difficulty
          </span>
          <span
            className={
              data.predictedDifficulty === 'Easy'
                ? 'font-semibold text-2xl text-emerald-400 tabular-nums'
                : data.predictedDifficulty === 'Medium'
                  ? 'font-semibold text-2xl text-amber-400 tabular-nums'
                  : 'font-semibold text-2xl text-red-400 tabular-nums'
            }
          >
            {data.predictedDifficulty}
          </span>
        </div>
      </div>

      <div className='mt-5 grid gap-5 md:grid-cols-2'>
        <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
          <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
            Difficulty Breakdown
          </span>
          <div className='h-40'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={difficultyData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis
                  dataKey='name'
                  tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                  {difficultyData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={DIFFICULTY_COLORS[index]}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
          <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
            Coverage Breakdown
          </span>
          <div className='h-40'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={coverageData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                layout='vertical'
              >
                <XAxis
                  type='number'
                  tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey='name'
                  type='category'
                  tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                  {coverageData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COVERAGE_COLORS[index]}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {Object.keys(typeCounts).length > 0 && (
        <div className='mt-5 flex flex-wrap gap-2'>
          {Object.entries(typeCounts).map(([type, count]) => (
            <div
              key={type}
              className='flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1'
            >
              <span className='text-[0.55rem] text-slate-400'>{type}</span>
              <span className='font-mono text-[0.55rem] text-slate-500'>
                x{count}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import { QueryProvider } from '@aspiron/tanstack-client'
import { DemoComponent } from '@/DemoComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <QueryProvider>
      <div>
        <a href='https://vite.dev' target='_blank' rel='noopener'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank' rel='noopener'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Library Demo - Vite + React</h1>
      <div className='card'>
        <button type='button' onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className='demo-section'>
        <h2>Service Layer Libraries</h2>
        <p>✅ API Client: HTTP services with cookie-based auth</p>
        <p>✅ TanStack Client: React Query hooks with caching</p>
        <p>🔧 Ready for backend integration</p>
        <DemoComponent />
      </div>

      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </QueryProvider>
  )
}

export default App

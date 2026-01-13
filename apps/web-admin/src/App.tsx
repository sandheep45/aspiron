import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import { sum as apiSum } from '@aspiron/api-client'
import { sum as tanstackSum } from '@aspiron/tanstack-client'
import { DemoComponent } from '@/DemoComponent'

function App() {
  const [count, setCount] = useState(0)

  const demoApiSum = apiSum(5, 3)
  const demoTanstackSum = tanstackSum(10, 7)

  return (
    <>
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
        <h2>Library Function Demos</h2>
        <p>API Client sum(5, 3) = {demoApiSum}</p>
        <p>Tanstack Client sum(10, 7) = {demoTanstackSum}</p>
        <DemoComponent />
      </div>

      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

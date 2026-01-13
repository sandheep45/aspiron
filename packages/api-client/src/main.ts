import './style.css'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import typescriptLogo from './typescript.svg'

const appElement = document.querySelector<HTMLDivElement>('#app')
if (!appElement) throw new Error('App element not found')
appElement.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

const counterElement = document.querySelector<HTMLButtonElement>('#counter')
if (!counterElement) throw new Error('Counter element not found')
setupCounter(counterElement)

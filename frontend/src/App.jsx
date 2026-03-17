import { useState, useEffect, useRef } from 'react'
import ChatMessage from './components/ChatMessage'
import Sidebar from './components/Sidebar'
import ConfigPanel from './components/ConfigPanel'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [config, setConfig] = useState({
    temperature: 0.7,
    max_new_tokens: 2048,
    top_p: 0.8,
  })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])

    let fullText = ''
    const eventSource = new EventSource(`/api/chat?messages=${encodeURIComponent(JSON.stringify([...messages, userMessage]))}&temperature=${config.temperature}&max_new_tokens=${config.max_new_tokens}&top_p=${config.top_p}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      fullText += data.text
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].content = fullText
        return newMessages
      })
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsLoading(false)
    }

    eventSource.addEventListener('done', () => {
      eventSource.close()
      setIsLoading(false)
    })
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        clearChat={clearChat}
        messageCount={messages.length}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <h1 className="text-4xl font-bold mb-4 text-gray-700 dark:text-gray-200">
                Chat LLM WebUI
              </h1>
              <p className="text-lg max-w-xl">
                本地大模型聊天界面，隐私安全，完全可控。开始你的对话吧！
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '生成中...' : '发送'}
            </button>
          </form>
        </div>
      </main>

      <ConfigPanel config={config} setConfig={setConfig} />
    </div>
  )
}

export default App

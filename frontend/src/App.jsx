import { useState, useEffect, useRef } from 'react'
import ChatMessage from './components/ChatMessage'
import Sidebar from './components/Sidebar'
import ConfigPanel from './components/ConfigPanel'
import './App.css'

function App() {
  const [conversations, setConversations] = useState([
    { id: 'default', title: '新对话', messages: [], createdAt: Date.now() }
  ])
  const [currentConversationId, setCurrentConversationId] = useState('default')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [config, setConfig] = useState({
    temperature: 0.7,
    max_new_tokens: 2048,
    top_p: 0.8,
    repetition_penalty: 1.1,
  })
  const messagesEndRef = useRef(null)

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId) || conversations[0]
  const messages = currentConversation?.messages || []

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-llm-conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConversations(parsed.conversations)
        setCurrentConversationId(parsed.currentId)
      } catch (e) {
        console.error('Failed to load conversations:', e)
      }
    } else if (messages.length === 0) {
      // Create default conversation if none exists
      setConversations([
        { id: 'default', title: '新对话', messages: [], createdAt: Date.now() }
      ])
      setCurrentConversationId('default')
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('chat-llm-conversations', JSON.stringify({
      conversations,
      currentId: currentConversationId
    }))
  }, [conversations, currentConversationId])

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

  // Update conversation messages
  const updateCurrentConversation = (newMessages) => {
    setConversations(prev => prev.map(c => 
      c.id === currentConversationId 
        ? { ...c, messages: newMessages } 
        : c
    ))
  }

  // Create new conversation
  const createNewConversation = () => {
    const newId = Date.now().toString()
    const newConv = {
      id: newId,
      title: '新对话',
      messages: [],
      createdAt: Date.now()
    }
    setConversations([newConv, ...conversations])
    setCurrentConversationId(newId)
    setInput('')
  }

  // Switch conversation
  const switchConversation = (id) => {
    setCurrentConversationId(id)
    setInput('')
    setIsLoading(false)
  }

  // Delete conversation
  const deleteConversation = (id) => {
    if (conversations.length <= 1) {
      // If deleting last conversation, create a new one
      setConversations([
        { id: 'default', title: '新对话', messages: [], createdAt: Date.now() }
      ])
      setCurrentConversationId('default')
    } else {
      const newConversations = conversations.filter(c => c.id !== id)
      setConversations(newConversations)
      if (id === currentConversationId) {
        setCurrentConversationId(newConversations[0].id)
      }
    }
  }

  // Update conversation title based on first message
  const updateConversationTitle = (messages) => {
    if (messages.length > 0 && currentConversation.title === '新对话') {
      const firstMessage = messages[0].content
      // Take first 20 characters as title
      const newTitle = firstMessage.slice(0, 20) + (firstMessage.length > 20 ? '...' : '')
      setConversations(prev => prev.map(c => 
        c.id === currentConversationId 
          ? { ...c, title: newTitle } 
          : c
      ))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    updateCurrentConversation(newMessages)
    updateConversationTitle(newMessages)
    setInput('')
    setIsLoading(true)

    const assistantMessage = { role: 'assistant', content: '' }
    updateCurrentConversation([...newMessages, assistantMessage])

    let fullText = ''
    const eventSource = new EventSource(
      `/api/chat?messages=${encodeURIComponent(JSON.stringify(newMessages))}&temperature=${config.temperature}&max_new_tokens=${config.max_new_tokens}&top_p=${config.top_p}&repetition_penalty=${config.repetition_penalty}`
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      fullText += data.text
      updateCurrentConversation([...newMessages, { role: 'assistant', content: fullText }])
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

  const clearCurrentChat = () => {
    updateCurrentConversation([])
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        createNewConversation={createNewConversation}
        switchConversation={switchConversation}
        deleteConversation={deleteConversation}
        clearCurrentChat={clearCurrentChat}
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
              <button 
                onClick={createNewConversation}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                ➕ 开始新对话
              </button>
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

export default function Sidebar({ darkMode, toggleDarkMode, clearChat, messageCount }) {
  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Chat LLM</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          本地大模型聊天界面
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={clearChat}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-2"
        >
          🗑️ 清空对话
        </button>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          当前对话: {messageCount} 条消息
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? '☀️ 浅色模式' : '🌙 深色模式'}
        </button>
      </div>
    </aside>
  )
}

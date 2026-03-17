export default function Sidebar({ 
  conversations, 
  currentConversationId, 
  darkMode, 
  toggleDarkMode, 
  createNewConversation,
  switchConversation,
  deleteConversation,
  clearCurrentChat
}) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Chat LLM</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          本地大模型聊天界面
        </p>
        <button
          onClick={createNewConversation}
          className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          ➕ 新建对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            暂无对话，点击上方新建对话
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  conv.id === currentConversationId 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => switchConversation(conv.id)}
              >
                <div className="overflow-hidden">
                  <div className="truncate text-sm font-medium">
                    {conv.title || '新对话'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {conv.messages.length} 条消息 · {formatDate(conv.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity p-1"
                  title="删除对话"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={clearCurrentChat}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          🗑️ 清空当前对话
        </button>
        
        <button
          onClick={toggleDarkMode}
          className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          {darkMode ? '☀️ 浅色模式' : '🌙 深色模式'}
        </button>
      </div>
    </aside>
  )
}

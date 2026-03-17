import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-gray-200 dark:bg-gray-800 rounded-bl-sm'
      }`}>
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

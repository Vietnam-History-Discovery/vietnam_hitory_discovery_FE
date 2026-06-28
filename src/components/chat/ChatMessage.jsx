import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user' || role === 'USER'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0 mt-0.5">
          ✦
        </div>
      )}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && (
          <span className="text-[10px] text-primary tracking-wide font-medium px-1">
            Chronicle AI
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-primary text-gray-900 rounded-br-sm font-medium'
              : 'bg-surface2 text-gray-200 rounded-bl-sm border border-surface2/80'
          }`}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4 text-white" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2 mt-3 text-white" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="border-collapse table-auto w-full text-sm" {...props} /></div>,
                th: ({node, ...props}) => <th className="border border-surface1 px-4 py-2 text-left font-bold text-white bg-surface1/50" {...props} />,
                td: ({node, ...props}) => <td className="border border-surface1 px-4 py-2 text-gray-300" {...props} />,
                code: ({node, inline, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <div className="bg-[#1e1e1e] rounded-md my-2 overflow-hidden border border-surface1">
                      {match && (
                        <div className="bg-surface1 px-3 py-1 text-xs text-gray-400 font-mono flex justify-between items-center">
                          {match[1]}
                        </div>
                      )}
                      <pre className="p-3 overflow-x-auto text-sm">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-black/30 rounded px-1.5 py-0.5 text-xs font-mono text-primary/90" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}

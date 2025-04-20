import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './Chat.css'

interface Message {
  id: number
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface Paper {
  title: string
  authors: string
  published: string
  abstract: string
  url: string
}

function parsePapers(text: string): Paper[] | null {
  // Detect the "Found X papers:" pattern
  const match = text.match(/^Found \d+ papers:\n([\s\S]*)$/)
  if (!match) return null

  // Split papers by double newlines
  const papersRaw = match[1].split(/\n{2,}/)
  const papers: Paper[] = []

  for (const raw of papersRaw) {
    const title = (raw.match(/\*\*Title:\*\* (.*)/)?.[1] || '').trim()
    const authors = (raw.match(/\*\*Authors:\*\* (.*)/)?.[1] || '').trim()
    const published = (raw.match(/\*\*Published:\*\* (.*)/)?.[1] || '').trim()
    const abstract = (raw.match(/\*\*Abstract:\*\* ([\s\S]*?)\*\*PDF:/)?.[1]?.trim() || '')
    const url = (raw.match(/\*\*PDF:\*\* (.*)/)?.[1] || '').trim()
    if (title) {
      papers.push({ title, authors, published, abstract, url })
    }
  }
  return papers.length ? papers : null
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Send message to backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      const data = await response.json()

      // Add assistant response
      const assistantMessage: Message = {
        id: messages.length + 1,
        text: data.response,
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }, [messages])

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>ScholarMind Assistant</h2>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-bubble">
              <div className="message-content">
                {message.sender === 'user' ? (
                  <div>{message.text}</div>
                ) : (
                  (() => {
                    const papers = parsePapers(message.text)
                    if (papers) {
                      return (
                        <div className="papers-list">
                          {papers.map((paper, idx) => (
                            <div className="paper-card" key={idx}>
                              <div className="paper-title"><strong>{paper.title}</strong></div>
                              <div className="paper-authors"><em>{paper.authors}</em></div>
                              <div className="paper-published">{paper.published}</div>
                              <div className="paper-abstract">{paper.abstract}</div>
                              <a href={paper.url} target="_blank" rel="noopener noreferrer" className="paper-link">View PDF</a>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    // fallback to markdown for normal LLM responses
                    return (
                      <ReactMarkdown>
                        {message.text}
                      </ReactMarkdown>
                    )
                  })()
                )}
              </div>
              <div className="message-timestamp">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-bubble">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? 'Waiting...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default Chat 
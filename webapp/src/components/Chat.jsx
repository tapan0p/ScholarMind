import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import axios from "axios";

const parsePapers = (text) => {
  // Detect the "Found X papers:" pattern
  const match = text.match(/^Found \d+ papers:\n([\s\S]*)$/);
  if (!match || !match[1]) return null;

  
  const papersRaw = match[1].trim().split(/\n\s*\n+/);
  const papers = [];

  for (const raw of papersRaw) {
    if (!raw.trim()) continue;

    const titleMatch = raw.match(/\*\*Title:\*\* (.*)/);
    const authorsMatch = raw.match(/\*\*Authors:\*\* (.*)/);
    const publishedMatch = raw.match(/\*\*Published:\*\* (.*)/);
    const abstractMatch = raw.match(
      /\*\*Abstract:\*\* ([\s\S]*?)(?=\n\*\*PDF:\*\*|\n\n|$)/
    );
    const pdfMatch = raw.match(/\*\*PDF:\*\* (.*)/);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const authors = authorsMatch ? authorsMatch[1].trim() : "";
    const published = publishedMatch ? publishedMatch[1].trim() : "";
    const abstract = abstractMatch ? abstractMatch[1].trim() : "";
    const url = pdfMatch ? pdfMatch[1].trim() : "";

    if (title) {
      papers.push({ title, authors, published, abstract, url });
    }
  }
  return papers.length ? papers : null;
};


const Chat = ({ researchPapers, setResearchPapers }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm ScholarAI. How can I help with your research today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/chat",
        {
          message: inputMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      const assistantMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const customRenderers = {
    a: ({ node, ...props }) => {
      if (props.href && props.href.startsWith("https://")) {
        return (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue", textDecoration: "underline" }}
          />
        );
      }
      return <a {...props} />;
    },
  };

  const handlePaperSelect = (paper) => {
    if (setResearchPapers && paper) {
      const isDuplicate = researchPapers.some((p) => p.title === paper.title);
      if (isDuplicate) {
        return;
      }
      setResearchPapers((prev) => [...prev, paper]);
      console.log("Added to collection:", paper.title);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden max-h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          ScholarAI Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50 min-h-0">
        {messages.map((message) => {
          const papers =
            message.sender === "assistant" ? parsePapers(message.text) : null;
          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[95%] p-3 rounded-lg shadow-sm overflow-hidden ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                }`}
              >
                <div className="mb-1">
                  {message.sender === "assistant" ? (
                    papers ? (
                      <div className="space-y-4 max-w-full">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Found {papers.length} paper
                          {papers.length > 1 ? "s" : ""}:
                        </p>
                        {papers.map((paper, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
                          >
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                              {paper.title}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <p className="text-slate-600">
                                <span className="font-medium">Authors:</span>{" "}
                                {paper.authors}
                              </p>
                              <p className="text-slate-500">
                                <span className="font-medium">Published:</span>{" "}
                                {paper.published}
                              </p>
                              <div className="mt-3 text-slate-700 bg-slate-50 p-3 rounded-md">
                                <p className="font-medium mb-1">Abstract:</p>
                                <p className="text-sm leading-relaxed">
                                  {paper.abstract}
                                </p>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => handlePaperSelect(paper)}
                                  className="px-2 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center cursor-pointer active:scale-95 active:bg-emerald-800"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                  Add to Collection
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      message.text
                    )
                  ) : (
                    // User messages are plain text
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
                <div
                  className={`text-xs ${
                    message.sender === "user"
                      ? "text-blue-200"
                      : "text-slate-400"
                  } text-right`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg rounded-tl-none shadow-sm bg-white border border-slate-200">
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-slate-200 bg-white flex-shrink-0"
      >
        <div className="flex items-center bg-slate-50 rounded-full px-4 py-1 shadow-sm border border-slate-200">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about research papers..."
            className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-slate-700 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing
              </span>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

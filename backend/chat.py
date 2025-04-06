from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph,START,END 
from langgraph.graph.message import add_messages
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage, HumanMessage


class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

model = ChatOllama(model="llama3.2:1b")

def chatbot(state: State):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)
app = workflow.compile()

# global conversation history
conversation_history = []

def chat_once(message):
    global conversation_history
    
    conversation_history.append(HumanMessage(content=message))
    result = app.invoke({"messages": conversation_history})
    bot_message = result["messages"][-1]
    conversation_history.append(bot_message)
    
    return bot_message.content
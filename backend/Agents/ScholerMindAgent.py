import os
from typing import Dict, List, TypedDict, Annotated
from langgraph.graph import StateGraph, END,START
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
import requests
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from Tools.searchTool import search_arxiv
from Agents.AgentNodes import State, llm_node, tool_node, should_call_tool



#Building the graph
workflow = StateGraph(State)

# Add nodes
workflow.add_node("llm",llm_node)
workflow.add_node("tools",tool_node)

# Add edges
workflow.add_edge(START,"llm")
workflow.add_conditional_edges(
    "llm",
    should_call_tool,
    {
        "tools": "tools",
        "end" : END
    }
)

workflow.add_edge("tools", END)

graph = workflow.compile()

def run_conversation(user_input:str, state:State=None):
    if state is None:
        state = {"messages": []}
    state["messages"].append(HumanMessage(content=user_input))
    result = graph.invoke(state)
    return result,result["messages"][-1].content


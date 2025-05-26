from langchain_core.messages import AIMessage
from Tools.searchTool import search_arxiv
from Tools.ragTool import query_rag
from typing import TypedDict, Annotated, List
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the LLM after loading environment variables
llm = ChatGroq(model="llama3-70b-8192")

# Define the prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful AI assistant capable of answering general questions, searching for research papers on arXiv, and answering questions based on indexed research papers.
    
    - Use the search_arxiv tool when the user explicitly asks to search for research papers (e.g., phrases like 'search for papers,' 'find papers,' or 'look up research on').
    
    - Use the query_rag tool when the user asks questions that might be answered by the research papers that have been indexed in the system. This tool retrieves relevant information from papers that have been previously added to the system.
    
    - For general questions not related to research papers, provide a concise and relevant response without using any tools."""),
    ("placeholder", "{messages}")
])

# Bind the tools to the LLM
llm_with_tools = llm.bind_tools([search_arxiv, query_rag])
# Create the model with the prompt and the tools
model = prompt | llm_with_tools


class State(TypedDict):
    messages: Annotated[List[HumanMessage | AIMessage], "The chat history"]

def llm_node(state:State) -> State:
    messages = state["messages"]
    response = model.invoke(state)
    return {"messages":messages+[response]}


def tool_node(state: State)->State:
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        tool_call = last_message.tool_calls[0]
        if tool_call["name"] == "search_arxiv":
            results = search_arxiv.invoke(tool_call["args"])
            tool_response = AIMessage(
                content = f"Found {len(results)} papers:\n" + "\n".join(
                    [f"**Title:** {paper['title']}\n"
                    f"**Authors:** {', '.join(paper['authors'])}\n"
                    f"**Published:** {paper['published']}\n"
                    f"**Abstract:** {paper['abstract']}\n"
                    f"**PDF:** {paper['url']}\n"
                    for paper in results]
                )
            )
            return {"messages":messages+[tool_response]}
        elif tool_call["name"] == "query_rag":
            result = query_rag.invoke(tool_call["args"])
            tool_response = AIMessage(
                content = f"Based on the indexed research papers: {result}"
            )
            return {"messages":messages+[tool_response]}
        else:
            print("No tool called")
    return state

def should_call_tool(state:State) -> str:
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "end"
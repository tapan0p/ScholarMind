from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Agents.ScholerMindAgent import run_conversation
from Agents.AgentNodes import State

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

state: State = {"messages": []}

@app.post("/chat")
async def chat(message: ChatMessage):
    global state
    state,response = run_conversation(user_input=message.message,state=state)
    print(response)
    return {"response": response}

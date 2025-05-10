from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from Agents.ScholerMindAgent import run_conversation
from Agents.AgentNodes import State
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend build (static files)
# app.mount("/", StaticFiles(directory="webapp/dist", html=True), name="static")

class ChatMessage(BaseModel):
    message: str



@app.post("/chat")
async def chat(message: ChatMessage):
    response = run_conversation(user_input=message.message)
    print(response)
    return {"response": response}

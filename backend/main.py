from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

class ProcessRequest(BaseModel):
    filePath: str
    command: str

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/validate")
async def process_file(request: ProcessRequest):
    """
    Receives a file path and a command from the frontend,
    and will eventually call the C executables.
    """
    print("--- Data Received by Python Backend ---")
    print(f"File Path: {request.filePath}")
    print(f"Command: {request.command}")
    print("---------------------------------------")

    return {
        "status": "success",
        "message": f"Command '{request.command}' received for path '{request.filePath}'",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
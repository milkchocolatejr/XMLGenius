from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import glob

def validate_xml_file(file_path):
    """Validate a single XML file using the C validator"""
    try:
        # The brain executable should be in the parent directory
        print(file_path)
        brain_path = '../brain'
        if not os.path.exists(brain_path):
            # Try current directory as fallback
            brain_path = './brain'
            if not os.path.exists(brain_path):
                return {
                    "valid": False,
                    "message": "Validator executable not found. Please compile brain.c first."
                }
        
        result = subprocess.run(
            [brain_path, 'validate', '-p', file_path],
            capture_output=True,
            text=True,
            check=False  # Don't raise exception on non-zero exit
        )
        
        output = result.stdout.strip()
        print(f"[DEBUG] Validation output for {file_path}:\n{output}")
        
        # Parse the output to extract validation information
        # Check for INVALID first to avoid substring matching issues
        if "INVALID XML DOCUMENT" in output:
            # Extract detailed error information
            lines = output.split('\n')
            error_details = []
            
            for line in lines:
                if "ERROR AT LINE:" in line:
                    error_details.append(line.strip())
                elif "EXPECTED CLOSING TAG:" in line:
                    error_details.append(line.strip())
                elif "FOUND CLOSING TAG:" in line:
                    error_details.append(line.strip())
                elif "CONTEXT:" in line:
                    error_details.append(line.strip())
            
            error_message = "\n".join(error_details) if error_details else "Unknown validation error"
            
            return {
                "valid": False,
                "message": error_message
            }
        elif "VALID XML DOCUMENT" in output:
            return {
                "valid": True,
                "message": "Document is valid"
            }
        else:
            return {
                "valid": False,
                "message": f"Unexpected validator output: {output}"
            }
            
    except Exception as e:
        print(f"[ERROR] Exception during validation: {e}")
        return {
            "valid": False,
            "message": f"Validation failed: {str(e)}"
        }

def validate_folder(folder_path):
    """Validate all XML files in a folder"""
    try:
        # Find all XML files in the folder
        xml_pattern = os.path.join(folder_path, "*.xml")
        xml_files = glob.glob(xml_pattern)
        
        if not xml_files:
            return {
                "files": [],
                "message": "No XML files found in the specified folder"
            }
        
        validation_results = []
        
        for xml_file in xml_files:
            file_name = os.path.basename(xml_file)
            validation_result = validate_xml_file(xml_file)
            
            validation_results.append({
                "fileName": file_name,
                "valid": validation_result["valid"],
                "message": validation_result["message"] if not validation_result["valid"] else None
            })
        
        return {
            "files": validation_results
        }
        
    except Exception as e:
        print(f"[ERROR] Exception during folder validation: {e}")
        return {
            "files": [],
            "message": f"Folder validation failed: {str(e)}"
        }

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
    print("--- Data Received by Python Backend ---")
    print(f"File Path: {request.filePath}")
    print(f"Command: {request.command}")
    print("---------------------------------------")
    
    try:
        # Check if path exists
        if not os.path.exists(request.filePath):
            return {
                "valid": False,
                "message": f"Path does not exist: {request.filePath}"
            }
        
        # Determine if it's a file or folder
        if os.path.isfile(request.filePath):
            # Single file validation
            if not request.filePath.lower().endswith('.xml'):
                return {
                    "valid": False,
                    "message": "File is not an XML file"
                }
            
            result = validate_xml_file(request.filePath)
            return result
            
        elif os.path.isdir(request.filePath):
            # Folder validation
            result = validate_folder(request.filePath)
            return result
            
        else:
            return {
                "valid": False,
                "message": "Path is neither a file nor a directory"
            }
            
    except Exception as e:
        print(f"[ERROR] Exception in process_file: {e}")
        return {
            "valid": False,
            "message": f"Server error: {str(e)}"
        }
    
class RepairRequest(BaseModel):
    filePath: str
    repairType: str

@app.post("/repair")
async def repair_file(request: RepairRequest):
    """
    Receives a file path and a repair type, then runs the C executable
    with the correct flag (-o for top, -c for bottom).
    """
    print(f"--- Received Repair Request ---")
    print(f"File Path: {request.filePath}")
    print(f"Repair Type: {request.repairType}")
    
    brain_path = '../brain'

    if request.repairType == 'top':
        flag = '-o'
    elif request.repairType == 'bottom':
        flag = '-c'
    else:
        return {"status": "error", "message": "Invalid repair type specified."}
    
    result = subprocess.run(
        [brain_path, 'repair', '-p', request.filePath, flag],
        capture_output=True,
        text=True,
        check=False 
    )

    print(f"Executable finished with exit code: {result.returncode}")
    print(f"Output: {result.stdout}")
    if result.stderr:
        print(f"Error Output: {result.stderr}")

    return {"status": "success", "message": "Repair process completed."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
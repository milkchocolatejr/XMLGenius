# 🧙‍♂️ XML Genius

**Your all-in-one desktop solution for validating, visualizing, editing, and repairing any XML document with ease.**

XML Genius is a powerful, cross-platform desktop application built to solve the most common and frustrating issues when working with XML. Whether you are a developer debugging a complex data structure, a support engineer validating a customer's file, or a data analyst exploring a document, XML Genius provides the tools you need to work with confidence and speed.

<img width="1027" alt="image" src="https://github.com/user-attachments/assets/7897b5c2-0a80-46a7-b1ea-c690ba1f96a8" />

---

## ✨ Key Features

XML Genius is designed to be the definitive tool for all XML-related tasks, combining powerful backend logic with a clean, intuitive user interface.

* **Advanced Validation:** Instantly check if an XML file is well-formed. For folders, recursively find all XML files and get a batch summary of valid and invalid documents.
* **Intelligent Repair:** For documents with mismatched closing tags, use the one-click "Repair with Top" or "Repair with Bottom" functions to instantly fix the file.
* **Interactive Tree Visualization:** Don't just read XML—see it. Untangle complex nested structures with a zoomable, collapsible, and pannable node graph that makes understanding document hierarchy effortless.
* **Live XML Editor:** Open any XML document in a full-featured code editor with syntax highlighting. Make direct changes, add or remove nodes, and save your work with confidence.
* **Smart, Context-Aware Actions:** The application is smart. It knows whether you've selected a file or a folder and enables only the relevant actions, streamlining your workflow.
* **Cross-Platform:** Built with Electron, XML Genius runs natively on Windows, macOS, and Linux.

---

## 🚀 Why Choose XML Genius?

Working with XML can be tedious and error-prone. XML Genius was built to eliminate that friction.

* **Stop Guessing, Start Knowing:** The validation engine gives you immediate, clear feedback on document integrity, showing you the exact line and column of any errors.
* **Untangle Complexity:** The interactive tree view turns walls of text into a clear, explorable map of your data.
* **Edit with Confidence:** The built-in editor provides a professional-grade experience, preventing syntax errors as you type.
* **Fix Broken Files Instantly:** Instead of manually hunting for mismatched tags, let the smart repair functionality do it for you in a single click.
* **An Intuitive Workflow:** From selecting a file to choosing an action to viewing the results, every step is designed to be clear, fast, and user-friendly.

---

## 🛠️ Getting Started (For Developers)

To get a local copy up and running for development, follow these simple steps.

### Prerequisites

* [Node.js](https://nodejs.org/) (which includes npm)
* [Python](https://www.python.org/) (version 3.8+)
* A C/C++ compiler (for running the core logic executables)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/XMLGenius.git](https://github.com/your-username/XMLGenius.git)
    cd your-repo-name
    ```

2.  **Set up the Frontend (Electron & React):**
    ```sh
    cd electron-vite-project  # Or your frontend folder name
    npm install
    ```

3.  **Set up the Backend (Python):**
    *First, create a `requirements.txt` file in your `backend` folder with the following content:*
    ```txt
    # backend/requirements.txt
    fastapi
    uvicorn[standard]
    ```
    *Now, set up the virtual environment and install dependencies:*
    ```sh
    cd ../backend # Go back to the root and into the backend folder
    python3 -m venv venv
    source venv/bin/activate  # On macOS/Linux
    # venv\Scripts\activate    # On Windows
    pip install -r requirements.txt
    ```

### Running the Application

You will need two terminals running simultaneously for development.

1.  **Terminal 1: Start the Backend Server**
    ```sh
    cd backend
    source venv/bin/activate
    python3 main.py
    ```
    Your Python API will now be running on `http://127.0.0.1:8000`.

2.  **Terminal 2: Start the Frontend Application**
    ```sh
    cd electron-vite-project
    npm run dev
    ```
    Your Electron desktop application will launch and will be able to communicate with the backend.

---

## 📖 How to Use the Tool

1.  **Launch XML Genius.**
2.  Click the **"Browse..."** button to open a native file dialog.
3.  **Select an XML file or an entire folder** containing XML files. The application will automatically detect your selection type.
4.  The **Action Carousel** will display a list of available operations. If you selected a folder, some actions like "Display as Tree" will be disabled.
5.  **Click on an action** to select it. It will become highlighted.
6.  Click the **"Next"** button.
7.  A new screen will appear showing you the result of your chosen action—a validation report, an interactive tree, or the live editor.

---

## 💻 Technology Stack

* **Desktop Framework:** [Electron](https://www.electronjs.org/)
* **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) & [Vite](https://vitejs.dev/)
* **Backend API:** [Python](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
* **Core Logic:** High-performance C/C++ executables.
* **Code Editor:** [CodeMirror](https://codemirror.net/)
* **Tree Visualization:** [react-d3-tree](https://github.com/bkrem/react-d3-tree)

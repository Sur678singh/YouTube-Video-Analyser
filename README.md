# 🎯 VideoRAG - AI Powered YouTube Video Q&A System

VideoRAG is an AI-powered application that allows users to ask questions about any YouTube video and get accurate, context-aware answers using **Retrieval Augmented Generation (RAG)**.

---

## 🚀 Features

* 🎬 Extracts YouTube video transcripts automatically
* 🤖 AI-powered question answering using LLMs
* ⚡ Fast semantic search with vector embeddings
* 🔍 Context-aware answers from actual video content
* 📊 Generates summaries and insights
* 🌐 Works with multiple videos dynamically

---

## 🧠 How It Works

1. **Extract** – Fetch YouTube transcript
2. **Split** – Break into chunks
3. **Embed** – Convert text into vectors
4. **Retrieve** – Find relevant chunks
5. **Generate** – LLM produces final answer

---

## 🏗️ Tech Stack

### 🔹 Backend

* FastAPI
* LangChain
* FAISS (Vector Database)
* HuggingFace (Embeddings + LLM)
* YouTube Transcript API

### 🔹 Frontend

* HTML
* CSS
* JavaScript

---

## 📂 Project Structure

```
VideoRAG/
│
├── main.py
├── requirements.txt
├── .gitignore
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── favicon.ico    
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/VideoRAG.git
cd VideoRAG
```

### 2️⃣ Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Add Environment Variables

Create a `.env` file:

```
HUGGINGFACEHUB_API_TOKEN=your_api_key_here
```

---

## ▶️ Run the Project

### Start Backend

```bash
uvicorn youtubechatbotRAG:app --reload    # adjust with your file name here
```

Backend will run at:

```
http://localhost:8000
```

---

### Run Frontend

Open `index.html` in browser
(or use Live Server)

---

## 🔌 API Endpoint

### POST `/ask`

#### Request:

```json
{
  "video_id": "SJKr7BPOXY0",
  "question": "Summarize the video"
}
```

#### Response:

```json
{
  "answer": "This video explains...",
  "sources": ["chunk1...", "chunk2..."]
}
```

---

## ⚠️ Limitations

* Depends on availability of YouTube transcripts
* First request may be slow (embedding creation)
* Large videos may increase processing time

---

## 🚀 Future Improvements

* ✅ Caching vector database (FAISS persistence)
* ✅ Streaming responses (real-time output)
* ✅ Chat UI (like ChatGPT)
* ✅ Multi-video comparison
* ✅ Deployment (Render / AWS)


## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 💡 Author

**Suryansh Singh**
AI/ML Enthusiast 🚀

---
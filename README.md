
# 🚀 AI Resume Analyzer & Recruitment System

An AI-powered recruitment platform that automates resume screening, candidate evaluation, and hiring workflow using Node.js, React, MongoDB, and Python (FastAPI).

---

## 🎯 Features

### 👤 Candidate
- Register & Login
- View available jobs
- Apply with resume upload
- Get AI-based resume analysis
- Track application status

### 👨‍💼 Admin
- View all applications
- Shortlist / Reject candidates
- Forward candidates to recruitment team
- Create and manage job postings

### 👨‍💻 Recruitment Team
- View forwarded candidates
- Perform deep analysis
- Select candidates for interview
- Schedule interviews

---

## 🧠 AI Features

- Resume text extraction (PDF)
- Keyword matching with job description
- ATS scoring system
- Skill gap analysis
- Candidate ranking

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Tailwind CSS / Custom CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

### AI Service
- Python
- FastAPI
- PyPDF2
- NLP-based keyword matching

---

## ⚙️ System Architecture

```

Frontend (React)
↓
Node.js Backend (Express)
↓
Python AI Service (FastAPI)
↓
MongoDB Database

```

---

## 🔄 Workflow

1. Candidate registers and applies for a job
2. Resume is uploaded and sent to Python AI
3. AI analyzes resume and returns score
4. Admin reviews and shortlists candidates
5. Shortlisted candidates are forwarded
6. Recruitment team performs deep analysis
7. Interview is scheduled
8. Candidate tracks status via dashboard

---

## 📁 Project Structure

```

backend/
├── routes/
├── models/
├── middleware/
├── utils/
├── ai_service/
└── server.js

frontend/
├── pages/
├── components/
├── context/
├── utils/
└── App.js

```

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository
```

git clone [https://github.com/your-username/recruit-ai.git](https://github.com/your-username/recruit-ai.git)
cd recruit-ai

```

---

### 2️⃣ Backend Setup
```

cd backend
npm install

```

Create `.env`:
```

MONGO_URI=mongodb://127.0.0.1:27017/recruitment
JWT_SECRET=your_secret_key
PORT=5000

```

Run server:
```

node server.js

```

---

### 3️⃣ Python AI Setup
```

cd backend/ai_service
pip install fastapi uvicorn PyPDF2
uvicorn main:app --reload

```

---

### 4️⃣ Frontend Setup
```

cd frontend
npm install
npm start

```

---

## 🔑 Default Admin Login

```

Email: [admin@recruit.com](mailto:admin@recruit.com)
Password: Admin@123

```

---

## 📊 Future Enhancements

- Email/WhatsApp notifications
- Advanced NLP models (BERT)
- Resume ranking system
- Cloud deployment (AWS / Vercel)

---

## 👨‍💻 Author

SnehaKhanaganvi
Darshan S P
NamrathaGudigar
Venkat Naveen

---

## ⭐ Acknowledgements

This project is built as a final-year project with real-world architecture and AI integration.

---

## 📜 License

This project is open-source and available under the MIT License.
```


# 🚀 Nexvio — AI-Powered Interview Intelligence Platform

---

## 🌟 Overview

Nexvio is a next-generation AI-powered interview preparation and career intelligence platform designed to help candidates improve communication, confidence, posture, and interview performance using real-time AI analysis.

Nexvio combines AI interview simulation, posture tracking, facial emotion detection, speech intelligence, ATS resume analysis, and personalized feedback into one powerful platform.

---

# ✨ Core Features

---

## 🎤 AI Interview Simulation

- Real-time AI interviewer
- HR + Technical interview support
- Dynamic question generation
- Speech interaction
- AI-generated follow-up questions
- Personalized interview flow
- AI mock interview experience
- Real-time response analysis

---

## 😊 Emotion & Confidence Detection

- Facial emotion recognition
- Confidence scoring
- Sentiment tracking
- Stress level detection
- Engagement monitoring
- Real-time behavioral insights

---

## 🧍 AI Posture & Body Language Analysis

- Real-time posture tracking
- Face alignment detection
- Eye contact analysis
- Body movement analysis
- Interview posture feedback
- Attention tracking

---

## 🎙️ Voice & Speech Intelligence

- Speech clarity analysis
- Speaking pace detection
- Communication scoring
- Tone analysis
- Confidence tracking
- AI speech insights

---

## 📄 Resume & ATS Optimization

- Resume upload
- ATS score analysis
- Resume optimization suggestions
- Skill gap analysis
- AI career recommendations

---

## 📊 Analytics Dashboard

- Interview performance tracking
- AI-generated feedback reports
- Performance scorecards
- Personalized recommendations
- Progress analytics

---

## 🔐 Authentication System

- Secure login/signup
- Supabase Authentication
- Protected routes
- User profile management
- Session handling

---

# 🏗️ Tech Stack

---

## Frontend

- React Router v7
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Shadcn UI

---

## Backend & Database

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

---

## AI & Machine Learning

- Python
- TensorFlow
- Scikit-learn
- OpenCV
- FER (Facial Emotion Recognition)
- MediaPipe
- Praat-Parselmouth
- NumPy
- Pandas

---

## Deployment & DevOps

- Vercel
- Render
- Docker
- GitHub
- Docker Compose

---

# 📁 Project Structure

---

```bash
nexvio/
│
├── src/
│   ├── client/                         # Frontend React Application
│   │
│   ├── interview-analysis-service/    # AI Interview Analysis Service
│   │
│   └── posture-analysis-service/      # AI Posture Detection Service
│
├── docker-compose.yml
├── README.md
└── package.json
```

---

# ⚡ System Architecture

---

```text
                ┌──────────────────────┐
                │      Frontend        │
                │ React + Vite + RRv7  │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      Supabase        │
                │ Auth + Database      │
                └──────────┬───────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌────────────────────┐          ┌────────────────────┐
│ Interview Analysis │          │ Posture Analysis   │
│ Python ML Service  │          │ Python ML Service  │
└────────────────────┘          └────────────────────┘
```

---

# 🚀 Production Deployment

---

## Frontend Deployment (Vercel)

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

VITE_INTERVIEW_ANALYSIS_MICROSVC_BASE_URL=https://your-interview-service.onrender.com

VITE_POSTURE_ANALYSIS_MICROSVC_BASE_URL=https://your-posture-service.onrender.com

VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

---

## Backend Deployment (Render)

### Interview Analysis Service

```bash
Root Directory:
src/interview-analysis-service
```

### Posture Analysis Service

```bash
Root Directory:
src/posture-analysis-service
```

---

# 🐳 Docker Deployment

---

## Run Full Stack Locally

```bash
docker compose up --build -d
```

---

# 🛠️ Local Development Setup

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/nexvio.git
```

---

## 2️⃣ Navigate to Frontend

```bash
cd src/client
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Run Frontend

```bash
npm run dev
```

---

## 5️⃣ Run Interview Analysis Service

```bash
cd src/interview-analysis-service
pip install -r requirements.txt
python app.py
```

---

## 6️⃣ Run Posture Analysis Service

```bash
cd src/posture-analysis-service
pip install -r requirements.txt
python app.py
```

---

# 🌐 Environment Variables

---

## Frontend `.env`

```env
VITE_SUPABASE_URL=

VITE_SUPABASE_PUBLISHABLE_KEY=

VITE_INTERVIEW_ANALYSIS_MICROSVC_BASE_URL=

VITE_POSTURE_ANALYSIS_MICROSVC_BASE_URL=

VITE_WEB3FORMS_ACCESS_KEY=
```

---

# 🔒 Security Features

---

- Secure Authentication
- HTTPS Deployment
- Environment Variable Protection
- Protected Routes
- API Isolation
- Secure Database Access

---

# 📸 Main Modules

---

## 🧠 AI Interview Room

- Webcam-based AI interview
- Live speech analysis
- Real-time AI feedback
- Confidence analysis

---

## 📄 Resume Analyzer

- ATS score generation
- Resume improvement suggestions
- AI recommendations

---

## 📊 Dashboard Analytics

- Performance tracking
- AI insights
- Growth analytics

---

# 🎯 Future Roadmap

---

- AI Resume Builder
- Live Coding Interviews
- AI Career Coach
- AI Recruiter Assistant
- Company-specific Interview Simulation
- Advanced NLP Analysis
- Real-time AI Avatar Interviewer
- Multi-language Interview Support

---

# 🤝 Contributing

---

Contributions are welcome.

## Steps

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Create Pull Request

---

# 📜 License

---

MIT License

---

# 👨‍💻 Author

---

### Lingraj Malipatil

AI Engineer & Full Stack Developer

- AI & Machine Learning
- SaaS Development
- Full Stack Engineering
- Automation Systems

---

# ⭐ Support

---

If you like this project:

- ⭐ Star the repository
- 🍴 Fork the project
- 🚀 Share with developers
- 💡 Contribute improvements

---

# 💡 Vision

---

Nexvio aims to redefine interview preparation using artificial intelligence by creating a realistic, intelligent, and personalized interview ecosystem for candidates worldwide.

---

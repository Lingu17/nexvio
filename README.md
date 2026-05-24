# 🚀 Nexvio — AI-Powered Interview Intelligence Platform

<p align="center">
  <b>Next-Generation AI Interview Preparation & Career Intelligence Platform</b>
</p>

<p align="center">
  Real-time AI Interview Simulation • Emotion Detection • Posture Analysis • Resume Intelligence
</p>

---

# 🌐 Live Demo

### 🔗 Live Application
https://nexvio-snowy.vercel.app/

---

# 📸 Screenshots

<img width="1905" height="965" alt="image" src="https://github.com/user-attachments/assets/2a8ed26f-4069-49d5-9d45-b9ba3d8f1dda" />

<img width="1904" height="963" alt="image" src="https://github.com/user-attachments/assets/d20ce168-aa0e-4227-aaf2-4f39bf0dc392" />

<img width="1894" height="967" alt="image" src="https://github.com/user-attachments/assets/b570f881-36be-494c-a20a-ea1d737a2e48" />

<img width="1903" height="974" alt="image" src="https://github.com/user-attachments/assets/bfd54f7a-d63b-4ed9-bfa5-3a7f3463183b" />

<img width="1893" height="883" alt="image" src="https://github.com/user-attachments/assets/75bc1956-3ec3-4572-89ac-79076b36eb17" />

---

# 🌟 Overview

Nexvio is an advanced AI-powered interview preparation and career intelligence platform designed to help candidates improve communication skills, confidence, posture, and interview performance using real-time artificial intelligence.

The platform combines:
- 🎤 AI Interview Simulation
- 😊 Emotion & Confidence Detection
- 🧍 Posture & Body Language Analysis
- 🎙️ Speech Intelligence
- 📄 ATS Resume Analysis
- 📊 AI Analytics Dashboard

Nexvio creates a realistic AI interview environment with live webcam analysis, speech evaluation, personalized feedback, and performance tracking.

---

# ✨ Core Features

---

## 🎤 AI Interview Simulation

- Real-time AI interviewer
- Technical + HR interview support
- Dynamic AI-generated questions
- Personalized interview flow
- Speech-based interaction
- Follow-up question generation
- Real-time answer analysis

---

## 😊 Emotion & Confidence Detection

- Facial emotion recognition
- Confidence scoring
- Stress level analysis
- Sentiment tracking
- Engagement monitoring
- Behavioral insights

---

## 🧍 Posture & Body Language Analysis

- Real-time posture tracking
- Face alignment detection
- Eye contact monitoring
- Body movement analysis
- Attention tracking
- AI posture feedback

---

## 🎙️ Voice & Speech Intelligence

- Speech clarity analysis
- Speaking pace detection
- Tone analysis
- Communication scoring
- Confidence detection
- AI speech insights

---

## 📄 Resume & ATS Optimization

- Resume upload
- ATS compatibility scoring
- Resume optimization suggestions
- Skill gap analysis
- AI career recommendations

---

## 📊 Analytics Dashboard

- Performance scorecards
- AI-generated interview reports
- Progress tracking
- Personalized recommendations
- Interview analytics

---

## 🔐 Authentication & Security

- Secure login/signup
- Supabase Authentication
- Protected routes
- Session management
- Secure API communication

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
- FER
- MediaPipe
- Praat-Parselmouth
- NumPy
- Pandas

---

## Deployment & DevOps

- Vercel
- Render
- Docker
- Docker Compose
- GitHub

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
├── package.json
└── README.md
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

## Frontend Deployment — Vercel

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

VITE_INTERVIEW_ANALYSIS_MICROSVC_BASE_URL=https://your-interview-service.onrender.com

VITE_POSTURE_ANALYSIS_MICROSVC_BASE_URL=https://your-posture-service.onrender.com

VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key
```

---

## Backend Deployment — Render

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

## Run Entire Stack

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
- Protected Routes
- Secure API Access
- Environment Variable Protection
- Session Security

---

# 📌 Main Modules

---

## 🧠 AI Interview Room

- Live AI interview environment
- Webcam analysis
- Speech intelligence
- Real-time AI feedback

---

## 📄 Resume Analyzer

- ATS scoring
- Resume recommendations
- Skill analysis

---

## 📊 Dashboard Analytics

- Performance tracking
- Interview history
- AI-generated insights

---

# 🎯 Future Roadmap

---

- AI Resume Builder
- AI Career Coach
- Live Coding Interviews
- AI Recruiter Assistant
- Multi-language Support
- AI Avatar Interviewer
- Advanced NLP Analysis
- Company-specific Interview Simulation

---

# 🤝 Contributing

---

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Create a Pull Request

---

# 📜 License

---

MIT License

---

# 👨‍💻 Author

---

## Lingraj Malipatil

AI Engineer & Full Stack Developer

### Focus Areas
- Artificial Intelligence
- Machine Learning
- SaaS Platforms
- Full Stack Development
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

Nexvio aims to redefine interview preparation using artificial intelligence by building a realistic, intelligent, and personalized interview ecosystem for candidates worldwide.

---

#!/bin/bash

echo "🚀 Starting all services..."

# Store the root directory
ROOT_DIR="$(pwd)"

# Function for error handling
handle_error() {
  echo "❌ Error: $1"
  exit 1
}

# Function to start a service in the background
start_service() {
  cd "$1" || handle_error "Could not navigate to $1 directory"
  echo "🔍 Starting $2..."
  eval "$3" &
  echo "✅ $2 started (PID: $!)"
  cd "$ROOT_DIR" || handle_error "Could not navigate back to root directory"
}

# Start interview-analysis-service
echo "🔧 Setting up interview-analysis-service..."
cd "$ROOT_DIR/src/interview-analysis-service" || handle_error "Could not navigate to interview-analysis-service directory"

# Prompt for AssemblyAI API key
echo "📝 Please enter your ASSEMBLYAI_API_KEY:"
read -r ASSEMBLYAI_API_KEY
if [ -z "$ASSEMBLYAI_API_KEY" ]; then
  handle_error "ASSEMBLYAI_API_KEY is required"
fi
export ASSEMBLYAI_API_KEY

# Start the service
start_service "$ROOT_DIR/src/interview-analysis-service" "interview-analysis-service" "conda run -n ace python app.py"

# Start posture-analysis-service
start_service "$ROOT_DIR/src/posture-analysis-service" "posture-analysis-service" "conda run -n ace python app.py"

# Start client
start_service "$ROOT_DIR/src/client" "client" "npm run dev"

# Wait a bit for the client to start
echo "⏳ Waiting for services to initialize..."
sleep 5

# Open browser
echo "🌐 Opening application in browser..."
if command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:5173
elif command -v open &>/dev/null; then
  open http://localhost:5173
elif command -v start &>/dev/null; then
  start http://localhost:5173
else
  echo "ℹ️ Please open http://localhost:5173 in your browser"
fi

echo "🎉 All services are running!"
echo "ℹ️ Press Ctrl+C to stop all services"

# Wait for Ctrl+C
wait

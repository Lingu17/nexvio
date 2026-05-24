#!/bin/bash

echo "🏗️  Starting build process..."

# Store the root directory
ROOT_DIR="$(pwd)"

# Function for error handling
handle_error() {
  echo "❌ Error: $1"
  exit 1
}

# Build unified environment
echo "🔧 Setting up clean 'ace' environment manually to avoid OS conflicts..."
conda create -n ace python=3.10 -y
if conda install -n ace -c conda-forge ffmpeg ffprobe -y; then
  echo "✅ Successfully installed ffmpeg and ffprobe in 'ace' environment"
else
  handle_error "Failed to install ffmpeg/ffprobe in 'ace' environment"
fi
if conda run -n ace pip install tensorflow==2.13.0 keras==2.13.1 flask fastapi uvicorn mediapipe opencv-python numpy pandas scikit-learn torch jupyter gunicorn assemblyai xgboost librosa spacy praat-parselmouth flask-cors nltk; then
  echo "✅ Successfully created 'ace' conda environment and installed dependencies"
else
  handle_error "Failed to install dependencies in 'ace' environment"
fi

# Build client
echo "🔧 Building client..."
cd "$ROOT_DIR/src/client" || handle_error "Could not navigate to client directory"
echo "🧹 Cleaning previous client dependencies..."
rm -rf node_modules .vite .vite-temp build
if npm install; then
  echo "✅ Successfully installed client dependencies"
else
  handle_error "Failed to install client dependencies"
fi

echo "🎉 Build completed successfully! You can proceed with start script."

FROM continuumio/miniconda3:25.1.1-2

WORKDIR /app

# Install system dependencies for ML & OpenCV (OpenMP, OpenGL, GLib)
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy environment.yml file
COPY environment.yml .

# Create conda environment
RUN conda env create -f environment.yml

# Make RUN commands use the new environment
SHELL ["conda", "run", "-n", "interview-analysis-env", "/bin/bash", "-c"]

# Copy application code
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Run the application
CMD gunicorn --bind 0.0.0.0:$PORT "app:create_app()"

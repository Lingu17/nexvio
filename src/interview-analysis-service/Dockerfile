FROM continuumio/miniconda3:25.1.1-2

WORKDIR /app

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
CMD ["conda", "run", "--no-capture-output", "-n", "interview-analysis-env", "gunicorn", "--bind", "0.0.0.0:4000", "app:create_app()"]

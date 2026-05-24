import * as faceapi from 'face-api.js';

let isFaceApiLoaded = false;

/**
 * Initializes the face-api.js models from a CDN to avoid bundling heavy weights.
 */
export async function initFaceTracking() {
  if (isFaceApiLoaded) return;
  try {
    // Load tiny face detector and face landmarks from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
    isFaceApiLoaded = true;
  } catch (error) {
    console.error("Failed to initialize Face Tracking models:", error);
  }
}

/**
 * Analyzes a video element to extract eye contact and posture metrics.
 * @param videoEl The HTMLVideoElement to analyze
 * @returns Score modifications based on face presence and head rotation
 */
export async function analyzeVideoFrame(
  videoEl: HTMLVideoElement | null,
  canvasEl?: HTMLCanvasElement | null
) {
  if (!videoEl || !isFaceApiLoaded || videoEl.videoWidth === 0) {
    return { faceDetected: false, multipleFacesDetected: false, eyeContactDelta: 0, postureDelta: 0, isLookingAway: false };
  }

  try {
    // Detect all faces with landmarks
    const detections = await faceapi
      .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const ctx = canvasEl ? canvasEl.getContext("2d") : null;
    if (ctx && canvasEl) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }

    if (detections.length === 0) {
      // No face detected -> penalize scores
      return { faceDetected: false, multipleFacesDetected: false, eyeContactDelta: -2, postureDelta: -1, isLookingAway: false };
    }

    if (detections.length > 1) {
      // Multiple faces detected!
      if (ctx && canvasEl) {
        const resized = faceapi.resizeResults(detections, {
          width: canvasEl.width,
          height: canvasEl.height,
        });
        ctx.strokeStyle = "#f43f5e"; // Red
        ctx.lineWidth = 3;
        for (const det of resized) {
          const { x, y, width, height } = det.detection.box;
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = "rgba(244, 63, 94, 0.2)";
          ctx.fillRect(x, y, width, height);
        }
      }
      return { faceDetected: true, multipleFacesDetected: true, eyeContactDelta: -2, postureDelta: -1, isLookingAway: false };
    }

    const detection = detections[0];
    const landmarks = detection.landmarks;
    
    // Draw on canvas if provided
    if (ctx && canvasEl) {
      const resized = faceapi.resizeResults(detection, {
        width: canvasEl.width,
        height: canvasEl.height,
      });
      const { x, y, width, height } = resized.detection.box;
      
      // Draw premium futuristic brackets around the face
      ctx.strokeStyle = "#8b5cf6"; // Violet primary
      ctx.lineWidth = 3;
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 10;
      
      const len = Math.min(20, width * 0.25);
      
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + len);
      ctx.lineTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
      
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + width - len, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + len);
      ctx.stroke();
      
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + height - len);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + len, y + height);
      ctx.stroke();
      
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + width - len, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y + height - len);
      ctx.stroke();
      
      // Reset shadow blur
      ctx.shadowBlur = 0;
      
      // Draw subtle green dots on the landmarks to show tracking is alive
      ctx.fillStyle = "#10b981"; // emerald
      const landmarkPoints = resized.landmarks.positions;
      for (let i = 0; i < landmarkPoints.length; i += 4) {
        ctx.beginPath();
        ctx.arc(landmarkPoints[i].x, landmarkPoints[i].y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Status Label Box
      ctx.fillStyle = "rgba(139, 92, 246, 0.85)";
      ctx.fillRect(x, y - 25, 110, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("FACE TRACKED", x + 8, y - 12);
    }

    // Calculate simple head rotation / gaze proxy using eye and nose positions
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    
    // Average X of eyes vs nose X
    const eyesCenterX = (leftEye[0].x + rightEye[3].x) / 2;
    const noseCenterX = nose[0].x;
    const horizontalOffset = Math.abs(eyesCenterX - noseCenterX);

    // If horizontal offset is large, user is looking away or head is rotated significantly
    const isLookingAway = horizontalOffset > 15;
    const eyeContactDelta = isLookingAway ? -1 : 1;
    
    // Posture: check vertical coordinates relative to frame
    const isCentered = detection.detection.box.y > 0 && detection.detection.box.y < videoEl.videoHeight * 0.5;
    const postureDelta = isCentered ? 1 : -1;

    return { faceDetected: true, multipleFacesDetected: false, eyeContactDelta, postureDelta, isLookingAway };
  } catch (error) {
    console.warn("Face analysis frame skipped due to error", error);
    return { faceDetected: false, multipleFacesDetected: false, eyeContactDelta: 0, postureDelta: 0, isLookingAway: false };
  }
}

/**
 * Calculates a unified confidence score based on various live metrics.
 */
export function calculateLiveMetrics(currentConfidence: number, eyeContactScore: number, postureScore: number, fillerCount: number, paceWpm: number) {
  // Base confidence starts from historical or 80
  let newConfidence = currentConfidence;

  // Penalize for poor eye contact
  if (eyeContactScore < 70) newConfidence -= 0.5;
  if (eyeContactScore > 85) newConfidence += 0.2;

  // Penalize for poor posture
  if (postureScore < 75) newConfidence -= 0.5;
  
  // Penalize for high filler count per minute (approximation)
  if (fillerCount > 5) newConfidence -= (fillerCount * 0.1);

  // Penalize for speaking too fast or too slow
  if (paceWpm > 0) {
    if (paceWpm > 170) newConfidence -= 0.5; // Too fast
    if (paceWpm < 110) newConfidence -= 0.5; // Too slow
  }

  return Math.max(50, Math.min(99, newConfidence));
}

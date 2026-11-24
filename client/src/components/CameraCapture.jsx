import { useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onCapture, onClose, onFallback }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState('');

  // start / restart the camera whenever facingMode changes
  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    const start = async () => {
      setStarting(true);
      setError('');
      stop();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            'This browser does not expose the camera API. Make sure the site is served over HTTPS (or localhost).'
          );
        }
        if (!window.isSecureContext) {
          throw new Error(
            'Camera access requires a secure connection. Open this page over HTTPS (or via localhost).'
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch { /* autoplay may be deferred */ }
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access in your browser settings, or upload a screenshot instead.'
            : err?.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : err?.message || 'Could not open the camera.';
        setError(msg);
      } finally {
        if (!cancelled) setStarting(false);
      }
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [facingMode]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      'image/jpeg',
      0.9
    );
  };

  const switchCamera = () => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));

  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal__header">
          <h3 className="camera-modal__title">Take a photo</h3>
          <button type="button" className="camera-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="camera-modal__body">
          {error ? (
            <div className="camera-error">
              <div className="camera-error__icon">📷</div>
              <p className="camera-error__msg">{error}</p>
              <div className="camera-error__actions">
                <button type="button" className="btn btn--secondary" onClick={onClose}>
                  Cancel
                </button>
                {onFallback && (
                  <button type="button" className="btn btn--primary" onClick={onFallback}>
                    Use file picker
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="camera-stage">
              {starting && (
                <div className="camera-loading">
                  <div className="spinner" />
                  <p>Starting camera…</p>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
            </div>
          )}
        </div>

        {!error && (
          <div className="camera-modal__footer">
            <button
              type="button"
              className="camera-btn camera-btn--switch"
              onClick={switchCamera}
              title="Switch camera"
            >
              🔄
            </button>
            <button
              type="button"
              className="camera-shutter"
              onClick={capture}
              disabled={starting}
              aria-label="Capture photo"
            />
            <button type="button" className="camera-btn camera-btn--cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
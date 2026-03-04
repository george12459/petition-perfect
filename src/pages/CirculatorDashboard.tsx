import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  FileCheck, 
  ArrowLeft,
  Loader2,
  RefreshCw,
  User,
  MapPin,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOCRScanner } from '@/hooks/useOCRScanner';

const CirculatorDashboard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const { 
    isScanning, 
    scanProgress,
    scannedSignatures,
    rawText,
    error, 
    scanDocument, 
    clearResults 
  } = useOCRScanner();

  // CRITICAL: getUserMedia called directly in click handler for browser permission
  const handleStartCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Camera is not supported in this browser.');
        return;
      }

      const streamOptions: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        { video: true, audio: false },
      ];

      let mediaStream: MediaStream | null = null;
      let lastError: unknown = null;

      for (const options of streamOptions) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(options);
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!mediaStream) {
        throw lastError instanceof Error ? lastError : new Error('Could not start camera stream.');
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      streamRef.current = mediaStream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert('Camera access denied. Please check browser permissions.');
      } else if (err instanceof Error && err.name === 'NotReadableError') {
        alert('Camera is in use by another app or browser tab. Please close other camera apps and retry.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        alert('No usable camera was found. Please reconnect your camera (or disable virtual camera tools) and try again.');
      } else {
        alert('Could not start camera. Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !streamRef.current) return;

    const videoElement = videoRef.current;
    videoElement.srcObject = streamRef.current;
    videoElement.play().catch((playError) => {
      console.error('Video preview error:', playError);
    });
  }, [isCameraActive]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Camera preview is not ready yet. Please wait a moment and try again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
      scanDocument(imageData);
    }
  }, [stopCamera, scanDocument]);

  const resetScan = useCallback(() => {
    setCapturedImage(null);
    clearResults();
  }, [clearResults]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-accent" />
              <span className="font-semibold">Circulator Dashboard</span>
            </div>
          </div>
          <Badge variant="outline" className="text-accent border-accent">
            Camera Only
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Camera Section */}
        {!capturedImage && !isScanning && scannedSignatures.length === 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Petition Sheet</CardTitle>
                <CardDescription>
                  Use your camera to capture a petition sheet for text detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCameraActive ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={captureImage} className="flex-1 gap-2">
                        <Camera className="w-4 h-4" />
                        Capture
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full h-24 gap-3"
                    onClick={handleStartCamera}
                  >
                    <Camera className="w-6 h-6" />
                    Open Camera
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Position the petition sheet within the frame</p>
                <p>2. Ensure good lighting and a flat surface</p>
                <p>3. Capture when all signatures are visible</p>
                <p>4. Wait for automatic text detection</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-accent" />
              <h3 className="text-lg font-semibold mb-2">Processing Document</h3>
              <p className="text-muted-foreground mb-4">
                Running local text detection...
              </p>
              <Progress value={scanProgress} className="max-w-xs mx-auto" />
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {scannedSignatures.length > 0 && !isScanning && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detected Signatures</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetScan} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    New Scan
                  </Button>
                </div>
                <CardDescription>
                  {scannedSignatures.length} signature(s) detected via local OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-accent/10 text-center">
                  <div className="text-3xl font-bold text-accent">{scannedSignatures.length}</div>
                  <div className="text-sm text-muted-foreground">Names Detected</div>
                </div>
              </CardContent>
            </Card>

            {capturedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scanned Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={capturedImage} alt="Captured petition" className="w-full rounded-lg border" />
                </CardContent>
              </Card>
            )}

            {rawText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw Detected Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap overflow-x-auto">
                    {rawText}
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Signature Details</h3>
              {scannedSignatures.map((sig, index) => (
                <Card key={index} className="border-accent/30">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-accent/10">
                        <User className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{sig.name}</span>
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <p>{sig.address}</p>
                            <p>{sig.city}, {sig.zip}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Badge variant="secondary" className="text-xs">
                            OCR Confidence: {Math.round(sig.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="py-6 text-center text-muted-foreground">
                <p className="text-sm">🔒 Identity validation will be enabled later</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6 text-center text-destructive">
              <XCircle className="w-8 h-8 mx-auto mb-2" />
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={resetScan}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
};

export default CirculatorDashboard;

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const { 
    isScanning, 
    scannedSignatures,
    rawText,
    error, 
    scanDocument, 
    clearResults 
  } = useOCRScanner();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
        scanDocument(imageData);
      }
    }
  }, [stopCamera, scanDocument]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        scanDocument(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, [scanDocument]);

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
            Mobile
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Camera/Upload Section */}
        {!capturedImage && !isScanning && scannedSignatures.length === 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Petition Sheet</CardTitle>
                <CardDescription>
                  Use your camera to capture a petition sheet or upload an image file
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
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg" />
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-accent/50 animate-scan-line" />
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
                  <div className="grid gap-4">
                    <Button 
                      size="lg" 
                      className="h-24 gap-3"
                      onClick={startCamera}
                    >
                      <Camera className="w-6 h-6" />
                      Open Camera
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-16 gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </Button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
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
                <p>4. Wait for automatic validation</p>
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
                Extracting and validating signatures...
              </p>
              <Progress value={33} className="max-w-xs mx-auto" />
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {scannedSignatures.length > 0 && !isScanning && (
          <div className="space-y-6">
            {/* Summary Card */}
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
                  {scannedSignatures.length} signature(s) detected by Gemini OCR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-accent/10 text-center">
                  <div className="text-3xl font-bold text-accent">{scannedSignatures.length}</div>
                  <div className="text-sm text-muted-foreground">Names Detected</div>
                </div>
              </CardContent>
            </Card>

            {/* Captured Image Preview */}
            {capturedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scanned Document</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={capturedImage} 
                    alt="Captured petition" 
                    className="w-full rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}

            {/* Raw Text Output */}
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

            {/* Individual Signature Details */}
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
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <p>{sig.address}</p>
                            <p>{sig.city}, {sig.zip}</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
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

            {/* Placeholder for future validation */}
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

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
};

export default CirculatorDashboard;

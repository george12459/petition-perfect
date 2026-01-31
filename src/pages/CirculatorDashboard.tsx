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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOCRScanner } from '@/hooks/useOCRScanner';
import { STATUS_LABELS, type ValidationStatus } from '@/types/petition';

const StatusBadge = ({ status }: { status: ValidationStatus }) => {
  const colors: Record<ValidationStatus, string> = {
    G: 'bg-status-valid text-white',
    B: 'bg-status-invalid text-white',
    X: 'bg-status-manual text-white',
    D: 'bg-status-duplicate text-white',
    P: 'bg-status-pending text-white',
  };

  return (
    <Badge className={`${colors[status]} font-bold`}>
      {status} - {STATUS_LABELS[status]}
    </Badge>
  );
};

const StatusIcon = ({ status }: { status: ValidationStatus }) => {
  switch (status) {
    case 'G':
      return <CheckCircle2 className="w-5 h-5 text-status-valid" />;
    case 'B':
      return <XCircle className="w-5 h-5 text-status-invalid" />;
    case 'X':
      return <AlertTriangle className="w-5 h-5 text-status-manual" />;
    case 'D':
      return <Copy className="w-5 h-5 text-status-duplicate" />;
    case 'P':
      return <Clock className="w-5 h-5 text-status-pending" />;
    default:
      return null;
  }
};

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
    error, 
    scanDocument, 
    clearResults 
  } = useOCRScanner();

  // Calculate validation stats
  const validCount = scannedSignatures.filter(s => s.validationResult?.status === 'G').length;
  const invalidCount = scannedSignatures.filter(s => s.validationResult?.status === 'B').length;
  const manualCount = scannedSignatures.filter(s => s.validationResult?.status === 'X').length;
  const duplicateCount = scannedSignatures.filter(s => s.validationResult?.status === 'D').length;
  const pendingCount = scannedSignatures.filter(s => !s.validationResult || s.isValidating).length;

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
                  <CardTitle>Validation Results</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetScan} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    New Scan
                  </Button>
                </div>
                <CardDescription>
                  {scannedSignatures.length} signatures processed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-status-valid/10">
                    <div className="text-2xl font-bold text-status-valid">{validCount}</div>
                    <div className="text-xs text-muted-foreground">Valid</div>
                  </div>
                  <div className="p-2 rounded-lg bg-status-invalid/10">
                    <div className="text-2xl font-bold text-status-invalid">{invalidCount}</div>
                    <div className="text-xs text-muted-foreground">Invalid</div>
                  </div>
                  <div className="p-2 rounded-lg bg-status-manual/10">
                    <div className="text-2xl font-bold text-status-manual">{manualCount}</div>
                    <div className="text-xs text-muted-foreground">Manual</div>
                  </div>
                  <div className="p-2 rounded-lg bg-status-duplicate/10">
                    <div className="text-2xl font-bold text-status-duplicate">{duplicateCount}</div>
                    <div className="text-xs text-muted-foreground">Duplicate</div>
                  </div>
                  <div className="p-2 rounded-lg bg-status-pending/10">
                    <div className="text-2xl font-bold text-status-pending">{pendingCount}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
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

            {/* Individual Results */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Signature Details</h3>
              {scannedSignatures.map((sig, index) => (
                <Card key={index} className={`
                  ${sig.validationResult?.status === 'G' ? 'border-status-valid/50' : ''}
                  ${sig.validationResult?.status === 'B' ? 'border-status-invalid/50' : ''}
                  ${sig.validationResult?.status === 'X' ? 'border-status-manual/50' : ''}
                  ${sig.validationResult?.status === 'D' ? 'border-status-duplicate/50' : ''}
                `}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {sig.isValidating ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : sig.validationResult ? (
                          <StatusIcon status={sig.validationResult.status} />
                        ) : (
                          <Clock className="w-5 h-5 text-status-pending" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{sig.name}</span>
                          {sig.validationResult && (
                            <StatusBadge status={sig.validationResult.status} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sig.address}, {sig.city}, {sig.zip}
                        </p>
                        {sig.validationResult?.message && (
                          <p className="text-sm mt-1">
                            {sig.validationResult.message}
                          </p>
                        )}
                        {sig.validationResult?.suggestions && sig.validationResult.suggestions.length > 0 && (
                          <div className="mt-2 text-sm text-accent">
                            {sig.validationResult.suggestions.map((s, i) => (
                              <p key={i}>💡 {s}</p>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>OCR Confidence: {Math.round(sig.confidence * 100)}%</span>
                          {sig.validationResult && (
                            <span>
                              Match Score: {Math.round(sig.validationResult.confidenceScore * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <Button className="w-full" size="lg" disabled={pendingCount > 0}>
              Submit for Review
            </Button>
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

import { useState } from 'react';
import { useCamera } from '@/camera/useCamera';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  isSubmitting?: boolean;
}

export default function SelfieCapture({ onCapture, isSubmitting }: SelfieCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [useUpload, setUseUpload] = useState(false);

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'user',
    width: 640,
    height: 480,
    quality: 0.9,
    format: 'image/jpeg',
  });

  const handleCapture = async () => {
    const photo = await capturePhoto();
    if (photo) {
      const imageUrl = URL.createObjectURL(photo);
      setCapturedImage(imageUrl);
      await stopCamera();
      onCapture(photo);
    }
  };

  const handleRetake = async () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setUploadedFile(null);
    await startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setUploadedFile(file);
      onCapture(file);
    }
  };

  const handleSwitchToUpload = () => {
    if (isActive) {
      stopCamera();
    }
    setUseUpload(true);
  };

  const handleSwitchToCamera = async () => {
    setUseUpload(false);
    if (uploadedFile) {
      setUploadedFile(null);
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
      setCapturedImage(null);
    }
    await startCamera();
  };

  if (isSupported === false) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Camera is not supported on this device. Please upload a selfie instead.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label htmlFor="selfie-upload">Upload Selfie</Label>
          <Input
            id="selfie-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
        </div>
        {capturedImage && (
          <div className="space-y-2">
            <img
              src={capturedImage}
              alt="Uploaded selfie"
              className="w-full rounded-lg border"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Selfie uploaded successfully
            </div>
          </div>
        )}
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full rounded-lg border"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Selfie captured successfully
        </div>
        {!isSubmitting && (
          <Button
            onClick={handleRetake}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        )}
      </div>
    );
  }

  if (useUpload) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="selfie-upload">Upload Selfie</Label>
          <Input
            id="selfie-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Please upload a clear photo of your face
          </p>
        </div>
        {isSupported && (
          <Button
            onClick={handleSwitchToCamera}
            variant="outline"
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            Use Camera Instead
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            {error.type === 'permission' && ' Please allow camera access to continue.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative bg-muted rounded-lg overflow-hidden" style={{ minHeight: '360px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ minHeight: '360px', aspectRatio: '4/3' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-4">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Camera preview will appear here</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {!isActive && !error && (
          <Button
            onClick={startCamera}
            disabled={isLoading}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            {isLoading ? 'Starting Camera...' : 'Start Camera'}
          </Button>
        )}

        {isActive && (
          <Button
            onClick={handleCapture}
            disabled={isLoading}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            Capture Selfie
          </Button>
        )}

        {!isActive && (
          <Button
            onClick={handleSwitchToUpload}
            variant="outline"
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo Instead
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Position your face in the center of the frame for best results
      </p>
    </div>
  );
}

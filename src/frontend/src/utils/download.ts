export function downloadFile(data: Uint8Array, filename: string, mimeType: string = 'application/octet-stream') {
  // Use type assertion to work around TypeScript's strict buffer type checking
  const blob = new Blob([data as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

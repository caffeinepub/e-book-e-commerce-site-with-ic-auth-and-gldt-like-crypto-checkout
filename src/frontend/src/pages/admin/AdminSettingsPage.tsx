import { useState, useRef } from 'react';
import { useResetStore } from '@/hooks/useResetStore';
import { useExportCatalog, useImportCatalog } from '@/hooks/useCatalogTransfer';
import { parseCatalogFile, applyCatalogImportMode, type ImportMode } from '@/utils/catalogTransfer';
import { downloadJson } from '@/utils/download';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RotateCcw, AlertTriangle, CheckCircle2, Download, Upload, Info } from 'lucide-react';
import ReEnableBooksByIdentifierCard from '@/components/admin/ReEnableBooksByIdentifierCard';
import type { CatalogState } from '@/backend';

export default function AdminSettingsPage() {
  const { actor } = useActor();
  const resetMutation = useResetStore();
  const exportMutation = useExportCatalog();
  const importMutation = useImportCatalog();
  
  const [resetSuccess, setResetSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('overwrite');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedCatalog, setParsedCatalog] = useState<CatalogState | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleExport = async () => {
    try {
      const catalog = await exportMutation.mutateAsync();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `catalog-export-${timestamp}.json`;
      downloadJson(catalog, filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setParsedCatalog(null);

    try {
      const catalog = await parseCatalogFile(file);
      setParsedCatalog(catalog);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse catalog file');
      setSelectedFile(null);
    }
  };

  const handleImportConfirm = () => {
    if (parsedCatalog) {
      setShowImportConfirm(true);
    }
  };

  const handleImport = async () => {
    if (!parsedCatalog || !actor) return;

    try {
      let catalogToImport = parsedCatalog;

      // For merge mode, fetch current catalog and merge
      if (importMode === 'merge') {
        const currentCatalog = await actor.exportCatalog();
        catalogToImport = applyCatalogImportMode(currentCatalog, parsedCatalog, 'merge');
      }

      await importMutation.mutateAsync(catalogToImport);
      setImportSuccess(true);
      setSelectedFile(null);
      setParsedCatalog(null);
      setShowImportConfirm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setImportSuccess(false), 5000);
    } catch (error) {
      setShowImportConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft vs Live Explanation */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Draft and Live Environments</AlertTitle>
        <AlertDescription>
          Draft and Live deployments have separate data. Books uploaded in Draft will not appear on Live until you export the Draft catalog and import it into Live using the tools below. This is your "publish" workflow.
        </AlertDescription>
      </Alert>

      {/* Version 22 Recovery Instructions */}
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Recovering Version 22 Uploads</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300 space-y-2">
          <p>
            To restore your Version 22 uploads to Live (radicaleconomist101-h78.caffeine.xyz):
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>You need a catalog export file from Version 22 (if you exported one before)</li>
            <li>Log into Live as admin at radicaleconomist101-h78.caffeine.xyz</li>
            <li>Navigate to Admin → Settings (this page)</li>
            <li>Use the Import Catalog section below to upload your Version 22 export file</li>
            <li>Select your preferred import mode (Overwrite or Merge)</li>
            <li>Click Import Catalog to restore your books and media</li>
          </ol>
          <p className="font-semibold pt-2">
            ⚠️ Recovery is only possible if you have a Version 22 export file. If no export exists, the data cannot be recovered.
          </p>
        </AlertDescription>
      </Alert>

      {/* Re-enable Books by Identifier */}
      <ReEnableBooksByIdentifierCard />

      {/* Export Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Catalog
          </CardTitle>
          <CardDescription>
            Download your complete catalog as a JSON file (includes all books, media references, orders, and user data)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exportSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-200">Export Complete</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your catalog has been downloaded successfully. Save this file to restore your content later.
              </AlertDescription>
            </Alert>
          )}

          {exportMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Export Failed</AlertTitle>
              <AlertDescription>
                {exportMutation.error instanceof Error
                  ? exportMutation.error.message
                  : 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleExport} 
            disabled={exportMutation.isPending}
            size="lg"
          >
            {exportMutation.isPending ? 'Exporting...' : 'Export Catalog'}
          </Button>
        </CardContent>
      </Card>

      {/* Import Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Catalog
          </CardTitle>
          <CardDescription>
            Upload a catalog JSON file to restore content (e.g., from Version 22 or publish Draft to Live)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {importSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-200">Import Complete</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your catalog has been imported successfully. All book covers and media should now be visible. The catalog view will update automatically.
              </AlertDescription>
            </Alert>
          )}

          {importMutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Import Failed</AlertTitle>
              <AlertDescription>
                {importMutation.error instanceof Error
                  ? importMutation.error.message
                  : 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
          )}

          {parseError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>File Parse Error</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="catalog-file" className="text-base">Select Catalog File</Label>
              <input
                ref={fileInputRef}
                id="catalog-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            {selectedFile && parsedCatalog && (
              <>
                <div className="space-y-3">
                  <Label className="text-base">Import Mode</Label>
                  <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overwrite" id="overwrite" />
                      <Label htmlFor="overwrite" className="font-normal cursor-pointer">
                        <span className="font-semibold">Overwrite:</span> Replace all existing data with imported catalog
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="merge" id="merge" />
                      <Label htmlFor="merge" className="font-normal cursor-pointer">
                        <span className="font-semibold">Merge:</span> Combine with existing data (imported data takes precedence for conflicts)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Ready to Import</AlertTitle>
                  <AlertDescription>
                    File: <span className="font-mono text-sm">{selectedFile.name}</span>
                    <br />
                    Mode: <span className="font-semibold">{importMode === 'overwrite' ? 'Overwrite' : 'Merge'}</span>
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleImportConfirm} 
                  disabled={importMutation.isPending}
                  size="lg"
                >
                  {importMutation.isPending ? 'Importing...' : 'Import Catalog'}
                </Button>
              </>
            )}
          </div>

          <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Catalog Import</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    You are about to import a catalog in <span className="font-semibold">{importMode}</span> mode.
                  </p>
                  {importMode === 'overwrite' && (
                    <p className="text-destructive font-semibold">
                      This will replace all existing catalog data with the imported data.
                    </p>
                  )}
                  {importMode === 'merge' && (
                    <p>
                      This will merge the imported data with existing data. Conflicts will be resolved in favor of the imported data.
                    </p>
                  )}
                  <p className="pt-2">
                    Are you sure you want to proceed?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport}>
                  Yes, Import Catalog
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Store Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Store Reset
          </CardTitle>
          <CardDescription>
            Reset your store to a clean state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning: Irreversible Action</AlertTitle>
              <AlertDescription>
                Resetting the store will permanently delete all books, orders, cart items, customer messages, and token balances.
                This action cannot be undone.
              </AlertDescription>
            </Alert>

            {resetSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Reset Complete</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your store has been successfully reset to a clean state.
                </AlertDescription>
              </Alert>
            )}

            {resetMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Reset Failed</AlertTitle>
                <AlertDescription>
                  {resetMutation.error instanceof Error
                    ? resetMutation.error.message
                    : 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? 'Resetting...' : 'Reset / Relaunch Store'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all books, orders, cart items,
                    customer messages, and token balances from your store.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Reset Store
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

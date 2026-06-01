import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { verificationService, type DocumentType } from '@/api/services/verificationService';
import { apiClient, APIError } from '@/lib/apiClient';
import { toast } from 'sonner';

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  gst_certificate: 'GST Certificate',
  pan_card: 'PAN Card',
  registration_certificate: 'Registration Certificate',
  other: 'Other',
};

interface VerifyAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function VerifyAccountDialog({ open, onOpenChange, onSubmitted }: VerifyAccountDialogProps) {
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }
    if (!documentFile) {
      toast.error('Please select a document file to upload');
      return;
    }
    try {
      setUploading(true);
      const uploadResult = await apiClient.uploadFile('/upload', documentFile, 'image');
      const documentUrl = uploadResult.url;
      setUploading(false);
      setSubmitting(true);
      await verificationService.submit({ documentType: documentType as DocumentType, documentUrl, notes: notes || undefined });
      toast.success('Verification request submitted. We will review it shortly.');
      onOpenChange(false);
      onSubmitted?.();
    } catch (err: any) {
      if (err instanceof APIError && err.statusCode === 409) {
        toast.info('Your previous request is still under review');
      } else {
        toast.error(err?.message || 'Failed to submit verification request');
      }
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const loading = uploading || submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Account Verification</DialogTitle>
          <DialogDescription>
            Submit a document for KYC verification. Our team will review and verify your account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-type">Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger id="doc-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DOC_TYPE_LABELS) as DocumentType[]).map((key) => (
                  <SelectItem key={key} value={key}>{DOC_TYPE_LABELS[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-file">Document File</Label>
            <Input
              id="doc-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for the reviewer..."
              rows={3}
              maxLength={1000}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

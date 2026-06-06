import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import type { TeacherConsultantConsent } from '@/api/types';
import { useAuth } from '@/context/AuthContext';

export function TeacherConsentToggle() {
  const { profile } = useAuth();
  const [consent, setConsent] = useState<TeacherConsultantConsent>({
    granted: (profile as any)?.consultantConsent?.granted ?? false,
    scope: (profile as any)?.consultantConsent?.scope ?? 'any',
  });

  useEffect(() => {
    setConsent({
      granted: (profile as any)?.consultantConsent?.granted ?? false,
      scope: (profile as any)?.consultantConsent?.scope ?? 'any',
    });
  }, [profile]);

  const handleToggle = async (granted: boolean) => {
    try {
      const updated = await apiClient.patch<any>('/teachers/me/consultant-consent', { granted, scope: 'any' });
      setConsent({
        granted: updated?.consultantConsent?.granted ?? granted,
        scope: updated?.consultantConsent?.scope ?? 'any',
      });
      toast.success(granted ? 'Consultants can now apply on your behalf' : 'Consultant access revoked');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consultant Representation</CardTitle>
        <CardDescription>Allow placement consultants to apply for jobs on your behalf.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Switch id="consent" checked={consent.granted} onCheckedChange={handleToggle} />
          <Label htmlFor="consent">{consent.granted ? 'Consultants may apply on your behalf' : 'Off — only you can apply'}</Label>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          You can revoke this anytime. Revoking cancels pending consultant-submitted applications still in the "proposed" stage.
        </p>
      </CardContent>
    </Card>
  );
}

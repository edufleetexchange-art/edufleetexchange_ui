import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ConsultantSignup() {
  const navigate = useNavigate();
  const { signupConsultant } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    agencyName: '', registrationNumber: '',
    yearsOfExperience: '5',
    subjects: '', levels: '', regions: '',
    bio: '', website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.name.trim()) next.name = 'Name required';
    if (!EMAIL_REGEX.test(formData.email)) next.email = 'Valid email required';
    if (formData.password.length < 6) next.password = 'Min 6 chars';
    if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords mismatch';
    const yrs = parseInt(formData.yearsOfExperience, 10);
    if (Number.isNaN(yrs) || yrs < 0) next.yearsOfExperience = 'Enter a number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signupConsultant({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        agencyName: formData.agencyName || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        specializations: { subjects: toList(formData.subjects), levels: toList(formData.levels), regions: toList(formData.regions) },
        bio: formData.bio || undefined,
        website: formData.website || undefined,
      });
      navigate('/consultant/dashboard');
    } catch {
      // AuthContext already toasts the error; swallow to keep the form mounted.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Job Consultant Signup</CardTitle>
          <CardDescription>
            Join eduFleet as a placement consultant to broker teacher hires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label htmlFor="cs-name">Name *</Label><Input id="cs-name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} aria-invalid={!!errors.name} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
              <div><Label htmlFor="cs-email">Email *</Label><Input id="cs-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} aria-invalid={!!errors.email} />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
              <div><Label htmlFor="cs-password">Password *</Label><Input id="cs-password" name="password" type="password" autoComplete="new-password" value={formData.password} onChange={handleChange} aria-invalid={!!errors.password} />{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}</div>
              <div><Label htmlFor="cs-confirm-password">Confirm Password *</Label><Input id="cs-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} aria-invalid={!!errors.confirmPassword} />{errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}</div>
              <div><Label htmlFor="cs-phone">Phone</Label><Input id="cs-phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} /></div>
              <div><Label htmlFor="cs-experience">Years of Experience *</Label><Input id="cs-experience" name="yearsOfExperience" type="number" min={0} value={formData.yearsOfExperience} onChange={handleChange} aria-invalid={!!errors.yearsOfExperience} />{errors.yearsOfExperience && <p className="text-xs text-destructive">{errors.yearsOfExperience}</p>}</div>
              <div><Label htmlFor="cs-agency">Agency Name (optional)</Label><Input id="cs-agency" name="agencyName" autoComplete="organization" value={formData.agencyName} onChange={handleChange} /></div>
              <div><Label htmlFor="cs-registration">Registration Number (optional)</Label><Input id="cs-registration" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} /></div>
            </div>
            <div><Label htmlFor="cs-subjects">Specialization — Subjects (comma-separated)</Label><Input id="cs-subjects" name="subjects" value={formData.subjects} onChange={handleChange} placeholder="Math, Physics" /></div>
            <div><Label htmlFor="cs-levels">Specialization — Levels (comma-separated)</Label><Input id="cs-levels" name="levels" value={formData.levels} onChange={handleChange} placeholder="Primary, Secondary" /></div>
            <div><Label htmlFor="cs-regions">Specialization — Regions (comma-separated)</Label><Input id="cs-regions" name="regions" value={formData.regions} onChange={handleChange} placeholder="Bengaluru, Mysore" /></div>
            <div><Label htmlFor="cs-website">Website (optional)</Label><Input id="cs-website" name="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://" /></div>
            <div><Label htmlFor="cs-bio">Bio (optional)</Label><Textarea id="cs-bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} /></div>
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Signing up…' : 'Create Consultant Account'}</Button>
            <p className="text-sm text-center">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConsultantSignup;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { AdSlot } from '@/components/ads/AdSlot';
import { mxPaperCard, mxTealPanel, mxDiamond, mxBtnInk, mxBtnOutline } from '@/lib/meridian';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

type FieldErrors = Partial<Record<
  'name' | 'email' | 'password' | 'confirmPassword' | 'phone' | 'location' | 'qualifications' | 'subjects',
  string
>>;

export function TeacherSignup() {
  const navigate = useNavigate();
  const { signupTeacher } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    experience: '',
    bio: '',
  });
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [currentQualification, setCurrentQualification] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateField = (field: keyof FieldErrors, value: string): string => {
    switch (field) {
      case 'name': return value.trim() ? '' : 'Enter your full name';
      case 'email': return EMAIL_RE.test(value) ? '' : 'Enter a valid email address';
      case 'password': return value.length >= 6 ? '' : 'Minimum 6 characters';
      case 'confirmPassword': return value === formData.password ? '' : 'Passwords do not match';
      case 'phone': return PHONE_RE.test(value) ? '' : 'Enter a 10-digit Indian mobile number';
      case 'location': return value.trim() ? '' : 'Enter your city';
      default: return '';
    }
  };

  const handleBlur = (field: keyof FieldErrors, value: string) => {
    const msg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: msg || undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the field-level error as soon as the user starts typing; it will
    // re-validate onBlur so we never persist stale messaging.
    if (errors[e.target.name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const addQualification = () => {
    if (currentQualification.trim() && !qualifications.includes(currentQualification.trim())) {
      setQualifications([...qualifications, currentQualification.trim()]);
      setCurrentQualification('');
    }
  };

  const removeQualification = (qual: string) => {
    setQualifications(qualifications.filter(q => q !== qual));
  };

  const addSubject = () => {
    if (currentSubject.trim() && !subjects.includes(currentSubject.trim())) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject('');
    }
  };

  const removeSubject = (subj: string) => {
    setSubjects(subjects.filter(s => s !== subj));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: FieldErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
      phone: validateField('phone', formData.phone),
      location: validateField('location', formData.location),
      qualifications: qualifications.length === 0 ? 'Add at least one qualification' : '',
      subjects: subjects.length === 0 ? 'Add at least one subject' : '',
    };
    // Strip empty strings — only keep real errors so `Object.keys` reflects fail count.
    Object.keys(next).forEach((k) => { if (!next[k as keyof FieldErrors]) delete next[k as keyof FieldErrors]; });
    setErrors(next);
    const failCount = Object.keys(next).length;
    if (failCount > 0) {
      toast.error(`${failCount} field${failCount === 1 ? '' : 's'} need${failCount === 1 ? 's' : ''} attention`);
      const firstFailId = Object.keys(next)[0];
      document.getElementById(firstFailId)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await signupTeacher({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        qualifications,
        experience: parseInt(formData.experience) || 0,
        subjects,
        bio: formData.bio,
        location: formData.location,
        isAvailable,
      });
      toast.success('Teacher account created successfully!');
      navigate('/teacher/dashboard');
    } catch {
      // AuthContext already toasted the error; leave the user on the form to retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#0B1626] py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        <Card className={mxPaperCard}>
          <CardHeader>
            <CardTitle className="mx-serif text-4xl font-semibold tracking-tight">Create Teacher Profile</CardTitle>
            <CardDescription className="text-[#0B1626]/55">
              Join EduFleet Exchange and find your next teaching opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="mx-serif flex items-center gap-3 text-xl font-semibold tracking-tight border-t border-[#0B1626]/10 pt-5"><span className={mxDiamond} aria-hidden="true"></span>Personal Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-err' : undefined}
                    required
                  />
                  {errors.name && <p id="name-err" className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-err' : undefined}
                    required
                  />
                  {errors.email && <p id="email-err" className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-err' : 'password-hint'}
                    required
                  />
                  {errors.password
                    ? <p id="password-err" className="text-sm text-destructive mt-1">{errors.password}</p>
                    : <p id="password-hint" className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-err' : undefined}
                    required
                  />
                  {errors.confirmPassword && (
                    <p id="confirm-err" className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={(e) => handleBlur('phone', e.target.value)}
                    placeholder="9876543210"
                    autoComplete="tel-national"
                    maxLength={10}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-err' : 'phone-hint'}
                    required
                  />
                  {errors.phone
                    ? <p id="phone-err" className="text-sm text-destructive mt-1">{errors.phone}</p>
                    : <p id="phone-hint" className="text-xs text-muted-foreground mt-1">10-digit Indian mobile number</p>}
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Delhi, India"
                    value={formData.location}
                    onChange={handleInputChange}
                    onBlur={(e) => handleBlur('location', e.target.value)}
                    autoComplete="address-level2"
                    aria-invalid={!!errors.location}
                    aria-describedby={errors.location ? 'location-err' : undefined}
                    required
                  />
                  {errors.location && <p id="location-err" className="text-sm text-destructive mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="mx-serif flex items-center gap-3 text-xl font-semibold tracking-tight border-t border-[#0B1626]/10 pt-5"><span className={mxDiamond} aria-hidden="true"></span>Professional Information</h3>
                
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="qualifications">Qualifications *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="qualifications"
                      value={currentQualification}
                      onChange={(e) => setCurrentQualification(e.target.value)}
                      placeholder="e.g., B.Ed, M.A."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addQualification();
                        }
                      }}
                    />
                    <Button type="button" className={mxBtnOutline} onClick={addQualification}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {qualifications.map((qual) => (
                      <Badge key={qual} variant="secondary" className="mx-mono text-xs rounded-none border border-[#16857B]/25 bg-[#16857B]/[0.07] text-[#16857B] hover:bg-[#16857B]/[0.12]">
                        {qual}
                        <button
                          type="button"
                          onClick={() => removeQualification(qual)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.qualifications && <p className="text-sm text-destructive mt-1">{errors.qualifications}</p>}
                </div>

                <div>
                  <Label htmlFor="subjects">Subjects *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="subjects"
                      value={currentSubject}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                      placeholder="e.g., Mathematics, English"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                    />
                    <Button type="button" className={mxBtnOutline} onClick={addSubject}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subj) => (
                      <Badge key={subj} variant="secondary" className="mx-mono text-xs rounded-none border border-[#16857B]/25 bg-[#16857B]/[0.07] text-[#16857B] hover:bg-[#16857B]/[0.12]">
                        {subj}
                        <button
                          type="button"
                          onClick={() => removeSubject(subj)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.subjects && <p className="text-sm text-destructive mt-1">{errors.subjects}</p>}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Availability Preference */}
              <div className={`space-y-4 p-4 ${mxTealPanel}`}>
                <h3 className="mx-serif text-xl font-semibold tracking-tight text-[#0B1626]">Institute Searchability</h3>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="isAvailable"
                    checked={isAvailable}
                    onCheckedChange={(checked) => setIsAvailable(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isAvailable" className="text-base cursor-pointer font-medium">
                      Available for institute searches
                    </Label>
                    <p className="text-sm text-[#11655D] mt-1">
                      By enabling this, institutes can discover and contact you directly for job opportunities. Your profile will be visible in institute searches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button type="submit" className={`w-full sm:w-auto sm:flex-1 h-11 ${mxBtnInk}`} disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create Profile'}
                </Button>
                <Button type="button" variant="outline" className={mxBtnOutline} onClick={() => navigate('/login')}>
                  Already have an account?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

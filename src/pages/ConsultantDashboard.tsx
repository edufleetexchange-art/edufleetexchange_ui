import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { rosterService } from '@/api/services/rosterService';
import { placementService } from '@/api/services/placementService';
import { interviewService } from '@/api/services/interviewService';
import { consultantService } from '@/api/services/consultantService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlacementCard } from '@/components/PlacementCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Placement, PlacementStage, Interview, ConsultantRosterEntry } from '@/api/types';

const KANBAN_STAGES: PlacementStage[] = ['proposed', 'applied', 'interviewing', 'offer_extended', 'placed'];

export function ConsultantDashboard() {
  const { account } = useAuth();
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [rosterTeachers, setRosterTeachers] = useState<ConsultantRosterEntry[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Array<{ job: any; score: number; bestTeacherAccountId: string }>>([]);

  const load = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const weekAhead = new Date(now.getTime() + 7 * 86400000);
      const [pl, iv, rt, rec] = await Promise.all([
        placementService.list({ pageSize: 100 }),
        interviewService.list({ status: 'scheduled', from: now.toISOString(), to: weekAhead.toISOString() }),
        rosterService.list({ entityType: 'teacher', pageSize: 100 }),
        consultantService.recommendedJobs(6).catch(() => ({ items: [], total: 0 })),
      ]);
      setPlacements(pl.items);
      setInterviews(iv.items);
      setRosterTeachers(rt.items);
      setRecommendedJobs(rec.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byStage = (s: PlacementStage) => placements.filter((p) => p.stage === s);
  const placedThisMonth = placements.filter((p) => {
    if (p.stage !== 'placed') return false;
    const placedAt = new Date(p.lastActivityAt);
    const now = new Date();
    return placedAt.getMonth() === now.getMonth() && placedAt.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return <div className="container mx-auto p-4 space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Consultant Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {account?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardHeader><CardTitle className="text-sm">Roster Teachers</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{rosterTeachers.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active Placements</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{placements.filter((p) => ['proposed','applied','interviewing','offer_extended'].includes(p.stage)).length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Interviews (next 7d)</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{interviews.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Placed This Month</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{placedThisMonth}</CardContent></Card>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <Link to="/consultant/placements" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
          {KANBAN_STAGES.map((stage) => (
            <div key={stage} className="space-y-2 min-w-[180px]">
              <div className="text-xs font-medium text-muted-foreground capitalize">{stage.replace('_', ' ')} ({byStage(stage).length})</div>
              {byStage(stage).slice(0, 4).map((p) => <PlacementCard key={p.id} placement={p} onChange={load} />)}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recommended jobs for your roster</h2>
          <Link to="/consultant/jobs" className="text-sm underline">Browse all jobs</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendedJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full py-8 text-center">Add teachers to your roster to see job recommendations.</p>
          ) : (
            recommendedJobs.map((r) => (
              <Link key={r.job.id ?? r.job._id} to={`/consultant/jobs/${r.job.id ?? r.job._id}`}>
                <Card className="hover:shadow-md transition-shadow"><CardContent className="p-3">
                  <p className="font-semibold text-sm">{r.job.title}</p>
                  <p className="text-xs text-muted-foreground">{r.job.instituteName} · {r.job.location?.city ?? r.job.location}</p>
                  <p className="text-xs mt-1">Match score: <strong>{(r.score).toFixed(0)}%</strong></p>
                </CardContent></Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ConsultantDashboard;

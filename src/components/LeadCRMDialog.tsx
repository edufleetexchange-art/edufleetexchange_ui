import { useState, useEffect } from 'react';
import { crmService, CRMActivity, CRMTask } from '@/api/services/crmService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Users, FileText, Calendar, Plus, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface LeadCRMDialogProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCRMDialog({ lead, isOpen, onClose }: LeadCRMDialogProps) {
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'note' as any,
    subject: '',
    description: '',
    outcome: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as any
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      loadActivities();
    }
  }, [isOpen, lead]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await crmService.getLeadActivities(lead._id);
      setActivities(response.data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load lead history');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setIsSubmitting(true);
      await crmService.createActivity({
        ...newActivity,
        leadId: lead._id
      });
      toast.success('Activity logged');
      setNewActivity({ type: 'note', subject: '', description: '', outcome: '' });
      loadActivities();
    } catch (error) {
      toast.error('Failed to log activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    try {
      setIsSubmitting(true);
      await crmService.createTask({
        ...newTask,
        leadId: lead._id
      });
      toast.success('Task assigned');
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium' });
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {lead?.name}
                <Badge variant="outline" className="text-xs uppercase">{lead?.type}</Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {lead?.instituteName || 'Individual Lead'} • {lead?.email} • {lead?.phone}
              </DialogDescription>
            </div>
            <Badge variant={lead?.status === 'closed' ? 'success' : 'outline'}>
              {lead?.status?.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Activity History */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b bg-muted/50 font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Activity History
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {loading ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Loading history...</p>
                ) : activities && activities.length > 0 ? (
                  activities.map((activity, idx) => (
                    <div key={activity._id} className="relative pl-6 pb-6 border-l last:pb-0">
                      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary z-10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm">{activity.subject}</h4>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
                        {activity.outcome && (
                          <div className="mt-2 text-[10px] bg-primary/5 p-1 rounded border border-primary/10">
                            <strong>Outcome:</strong> {activity.outcome}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-right text-muted-foreground italic">
                          By {activity.userId?.name}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No activities logged yet.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side: Actions */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <Tabs defaultValue="activity" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-2 rounded-none border-b bg-muted/30">
                <TabsTrigger value="activity">Log Activity</TabsTrigger>
                <TabsTrigger value="task">Assign Task</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="flex-1 p-4 overflow-y-auto">
                <form onSubmit={handleCreateActivity} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select 
                        value={newActivity.type} 
                        onValueChange={(val) => setNewActivity({...newActivity, type: val as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="call">Phone Call</SelectItem>
                          <SelectItem value="email">Email Sent</SelectItem>
                          <SelectItem value="meeting">Meeting Held</SelectItem>
                          <SelectItem value="note">Internal Note</SelectItem>
                          <SelectItem value="other">Other Interaction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input 
                        placeholder="e.g., Initial intro call" 
                        value={newActivity.subject}
                        onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="What was discussed?" 
                      className="h-24" 
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Outcome (Optional)</Label>
                    <Input 
                      placeholder="Result of this activity" 
                      value={newActivity.outcome}
                      onChange={(e) => setNewActivity({...newActivity, outcome: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Log Activity'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="task" className="flex-1 p-4 overflow-y-auto">
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input 
                      placeholder="e.g., Send follow-up quote" 
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Detailed task instructions" 
                      className="h-20"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input 
                        type="date" 
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select 
                        value={newTask.priority}
                        onValueChange={(val) => setNewTask({...newTask, priority: val as any})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" variant="secondary" disabled={isSubmitting}>
                    {isSubmitting ? 'Assigning...' : 'Assign Task'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

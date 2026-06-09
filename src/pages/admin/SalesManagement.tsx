import { useState, useEffect } from 'react';
import { adminService } from '@/api/services/adminService';
import { ConfirmDestructive } from '@/components/ConfirmDestructive';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  UserX, 
  UserCheck, 
  Trash2, 
  Handshake,
  Mail,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function SalesManagement() {
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    employeeId: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      // Filter for sales role
      const salesOnly = response.data.filter((user: any) => user.role === 'sales');
      setSalesUsers(salesOnly);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load sales team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSalesUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      const cleanData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'sales',
        employeeId: formData.employeeId.trim(),
        phone: formData.phone.trim(),
      };
      
      await adminService.createUser(cleanData);
      toast.success('Sales team member created successfully');
      setIsCreateOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sales team member');
    }
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminService.updateUserStatus(userId, { isActive });
      toast.success(`Sales member ${isActive ? 'activated' : 'suspended'} successfully`);
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const handleDeleteUser = (userId: string) => setPendingDeleteId(userId);
  const confirmDeleteUser = async () => {
    if (!pendingDeleteId) return;
    try {
      await adminService.deleteUser(pendingDeleteId);
      toast.success('Sales member deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete sales member');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales',
      employeeId: '',
      phone: '',
    });
  };

  const filteredUsers = salesUsers.filter(user => {
    return (
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Handshake className="w-8 h-8 text-primary" />
            Sales Team Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your internal sales force and tracking IDs</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Sales Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Sales Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSalesUser} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Sales" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.sales@edufleet.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID / Sales Code</Label>
                  <Input 
                    id="employeeId" 
                    placeholder="SLS-001" 
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="+91 9876543210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit">Create Sales Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or ID..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} members found
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Sales ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                  Loading sales team...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                  No sales members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {user.employeeId || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.phone || '-'}</div>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => window.location.href = `/sales/dashboard?userId=${user._id}`}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          View Performance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleUpdateStatus(user._id, false)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Suspend Access
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-500 focus:text-green-500"
                            onClick={() => handleUpdateStatus(user._id, true)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Restore Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ConfirmDestructive
        open={!!pendingDeleteId}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
        title="Delete this sales member?"
        description="This removes their account. They will lose access immediately."
        confirmLabel="Delete member"
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
}

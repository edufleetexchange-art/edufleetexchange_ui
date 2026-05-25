import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '@/api/services/adminService';
import { getAllSubscriptionPlans } from '@/api/services/subscriptionService';
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
  Edit,
  ShieldAlert,
  Eye
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDetailDialog } from '@/components/UserDetailDialog';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [creationType, setCreationType] = useState<'internal' | 'subscriber' | 'all'>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'institute',
    instituteName: '',
    contactPerson: '',
    phone: '',
    employeeId: '',
    planId: '',
  });

  useEffect(() => {
    loadData();
    
    // Handle action from query params
    const action = searchParams.get('action');
    if (action === 'create-internal') {
      setIsCreateOpen(true);
      setCreationType('internal');
      setFormData(prev => ({ ...prev, role: 'admin' }));
      // Clear the param after opening
      setSearchParams({});
    } else if (action === 'create-subscriber') {
      setIsCreateOpen(true);
      setCreationType('subscriber');
      setFormData(prev => ({ ...prev, role: 'institute' }));
      // Clear the param after opening
      setSearchParams({});
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, plansResponse] = await Promise.all([
        adminService.getAllUsers(),
        getAllSubscriptionPlans()
      ]);
      setUsers(usersResponse.data);
      setPlans(plansResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Clean up data before sending - don't send empty strings
      const cleanData: Record<string, string> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };
      
      if (formData.instituteName?.trim()) cleanData.instituteName = formData.instituteName.trim();
      if (formData.contactPerson?.trim()) cleanData.contactPerson = formData.contactPerson.trim();
      if (formData.phone?.trim()) cleanData.phone = formData.phone.trim();
      if (formData.employeeId?.trim()) cleanData.employeeId = formData.employeeId.trim();
      
      await adminService.createUser(cleanData);
      toast.success('User created successfully');
      setIsCreateOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Create user error:', error);
      // Extract the most specific error message available
      let errorMessage = 'Failed to create user';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      // Handle specific error codes with better messages
      if (error.code === 'DUPLICATE_ERROR' && error.field) {
        errorMessage = `A user with this ${error.field} already exists. Please use a different value.`;
      } else if (error.code === 'VALIDATION_ERROR' && error.details) {
        errorMessage = error.details.join('; ');
      } else if (error.code === 'USER_EXISTS') {
        errorMessage = 'A user with this email already exists.';
      } else if (error.code === 'EMPLOYEE_ID_EXISTS') {
        errorMessage = 'This Employee ID is already in use.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminService.updateUserStatus(userId, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully`);
      loadData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'institute',
      instituteName: '',
      contactPerson: '',
      phone: '',
      employeeId: '',
      planId: '',
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.instituteName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const roles = [
    { value: 'all', label: 'All Users' },
    { value: 'institute', label: 'Institutes' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'vendor', label: 'Vendors' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales Team' },
    { value: 'admin', label: 'Admins' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts, subscriptions, and status</p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Create User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => {
                  resetForm();
                  setCreationType('internal');
                  setFormData(prev => ({ ...prev, role: 'admin' }));
                  setIsCreateOpen(true);
                }}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Create Internal Account
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  resetForm();
                  setCreationType('subscriber');
                  setFormData(prev => ({ ...prev, role: 'institute' }));
                  setIsCreateOpen(true);
                }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Create Subscriber Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  resetForm();
                  setCreationType('all');
                  setIsCreateOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Generic Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {creationType === 'internal' ? 'Create Internal Account' : 
                   creationType === 'subscriber' ? 'Create Subscriber Account' : 
                   'Create New User'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => setFormData({...formData, role: value, planId: ''})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(creationType === 'all' || creationType === 'subscriber') && (
                          <>
                            <SelectItem value="institute">Institute</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                          </>
                        )}
                        {(creationType === 'all' || creationType === 'internal') && (
                          <>
                            <SelectItem value="marketing">Marketing Team</SelectItem>
                            <SelectItem value="sales">Sales Team</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.role === 'admin' || formData.role === 'marketing' || formData.role === 'sales') ? (
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input 
                        id="employeeId" 
                        placeholder="EMP123" 
                        value={formData.employeeId}
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="planId">Subscription Plan</Label>
                      <Select 
                        value={formData.planId} 
                        onValueChange={(value) => setFormData({...formData, planId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans
                            .filter(p => p.planType === (formData.role === 'vendor' ? 'vendor' : formData.role))
                            .map(plan => (
                              <SelectItem key={plan._id} value={plan._id}>
                                {plan.displayName} ({plan.price === 0 ? 'Free' : `₹${plan.price}`})
                              </SelectItem>
                            ))
                          }
                          {plans.filter(p => p.planType === (formData.role === 'vendor' ? 'vendor' : formData.role)).length === 0 && (
                            <SelectItem value="none" disabled>No plans available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {(formData.role === 'admin' || formData.role === 'marketing' || formData.role === 'sales') && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+91 9876543210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                )}
                {formData.role === 'institute' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instituteName">Institute Name</Label>
                      <Input 
                        id="instituteName" 
                        placeholder="Greenwood International" 
                        value={formData.instituteName}
                        onChange={(e) => setFormData({...formData, instituteName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input 
                        id="contactPerson" 
                        placeholder="Head Admin" 
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} users
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {roles.map(role => (
                <TabsTrigger key={role.value} value={role.value}>
                  {role.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Institute/Details</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.role === 'institute' ? (
                        <span>{user.instituteName || '-'}</span>
                      ) : (user.role === 'admin' || user.role === 'marketing' || user.role === 'sales') ? (
                        <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-0.5 rounded">
                          ID: {user.employeeId || 'N/A'}
                        </span>
                      ) : user.role === 'teacher' ? (
                        <span className="text-muted-foreground italic">Teacher Profile</span>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.subscription?.planId ? (
                        // NOTE: user.subscription is populated by the backend via $lookup; if missing, falls through to "No Active Plan"
                        <Badge variant="secondary" className="font-medium text-primary">
                          {plans.find(p => p._id === user.subscription?.planId)?.displayName || 'Custom Plan'}
                        </Badge>
                      ) : (['admin', 'marketing', 'sales'].includes(user.role)) ? (
                        <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20">
                          Internal Account
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic">No Active Plan</span>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleUpdateStatus(user._id, false)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-500 focus:text-green-500"
                            onClick={() => handleUpdateStatus(user._id, true)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteUser(user._id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
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

      <UserDetailDialog 
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        plans={plans}
      />
    </div>
  );
}
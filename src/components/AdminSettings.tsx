import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/context/ConfigContext';
import { adminService } from '@/api/services/adminService';

type Category = {
  _id: string;
  name: string;
  slug: string;
  type: 'vehicle' | 'job' | 'supplier';
  count?: number;
  isActive: boolean;
};

type Setting = {
  _id: string;
  key: string;
  value: any;
  description: string;
  group: string;
  isPublic: boolean;
};

export function AdminSettings() {
  const { getCategoryLabelsByType, refreshConfig } = useConfig();
  const [categories, setCategories] = useState<any[]>([]);

  const supplierCategoryLabels = getCategoryLabelsByType('supplier');
  const initialSupplierCategories = Object.entries(supplierCategoryLabels).map(([slug, name], index) => ({
    id: `sc-${index + 1}`,
    name,
    slug,
    count: 0 // Count from backend
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-muted-foreground">
          Manage categories and system configurations.
        </p>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicle Categories</TabsTrigger>
          <TabsTrigger value="jobs">Job Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Categories</TabsTrigger>
          <TabsTrigger value="system">System Config</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="space-y-4">
          <CategoryManager 
            title="Vehicle Categories" 
            description="Manage the types of vehicles that can be listed on the platform."
            type="vehicle"
          />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <CategoryManager 
            title="Job Categories" 
            description="Manage job roles and departments for recruitment."
            type="job"
          />
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4">
          <CategoryManager 
            title="Supplier Categories" 
            description="Manage service categories for vendor listings."
            type="supplier"
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemConfigManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryManager({ 
  title, 
  description, 
  type
}: { 
  title: string; 
  description: string; 
  type: 'vehicle' | 'job' | 'supplier';
}) {
  const { refreshConfig } = useConfig();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCategories(type);
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.warn('Categories endpoint unavailable:', error.message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleAdd = async () => {
    const slug = formData.slug || generateSlug(formData.name);
    try {
      const response = await adminService.createCategory({
        ...formData,
        slug,
        type,
      });
      
      if (response.success) {
        setCategories([...categories, response.data]);
        setIsAddOpen(false);
        setFormData({ name: '', slug: '', isActive: true });
        toast.success(`${formData.name} category added successfully`);
        refreshConfig(); // Update global config
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error.message || 'Failed to create category';
      toast.error(msg);
    }
  };

  const handleEdit = async () => {
    if (!currentCategory) return;
    
    try {
      const response = await adminService.updateCategory(currentCategory._id, formData);
      if (response.success) {
        setCategories(categories.map(c => 
          c._id === currentCategory._id ? response.data : c
        ));
        setIsEditOpen(false);
        setCurrentCategory(null);
        setFormData({ name: '', slug: '', isActive: true });
        toast.success('Category updated successfully');
        refreshConfig(); // Update global config
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error.message || 'Failed to update category';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!currentCategory) return;
    
    try {
      const response = await adminService.deleteCategory(currentCategory._id);
      if (response.success) {
        setCategories(categories.filter(c => c._id !== currentCategory._id));
        setIsDeleteOpen(false);
        setCurrentCategory(null);
        toast.success('Category deleted successfully');
        refreshConfig(); // Update global config
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const openEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name, slug: category.slug, isActive: category.isActive });
    setIsEditOpen(true);
  };

  const openDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for {type}s.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name, slug: generateSlug(name) });
                  }}
                  className="col-span-3"
                  placeholder="e.g. Electric Bus"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. electric-bus"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!formData.name}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(category)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No categories found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="edit-active">Enable this category</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold">{currentCategory?.name}</span>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function SystemConfigManager() {
  const { refreshConfig } = useConfig();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: any) => {
    try {
      const response = await adminService.updateSetting(key, { value });
      if (response.success) {
        setSettings(prev => prev.map(s => s.key === key ? response.data : s));
        toast.success(`Setting ${key} updated successfully`);
        refreshConfig(); // Update global config
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update setting');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Global platform settings and business rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {settings.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No system configurations found.
            </div>
          )}
          
          {Object.entries(
            settings.reduce((acc, setting) => {
              if (!acc[setting.group]) acc[setting.group] = [];
              acc[setting.group].push(setting);
              return acc;
            }, {} as Record<string, Setting[]>)
          ).map(([group, groupSettings]) => (
            <div key={group} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h3>
              <div className="grid gap-4">
                {groupSettings.map((setting) => (
                  <div key={setting._id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">{setting.key}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof setting.value === 'boolean' ? (
                          <Button 
                            variant={setting.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleUpdate(setting.key, !setting.value)}
                          >
                            {setting.value ? 'Enabled' : 'Disabled'}
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Input 
                              className="w-48"
                              defaultValue={setting.value}
                              onBlur={(e) => {
                                if (e.target.value !== String(setting.value)) {
                                  handleUpdate(setting.key, e.target.value);
                                }
                              }}
                            />
                            <Button size="icon" variant="ghost" disabled>
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
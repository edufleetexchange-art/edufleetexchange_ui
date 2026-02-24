import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { publicService, Category, SystemSetting } from '@/api/services/publicService';

interface ConfigContextType {
  categories: Category[];
  settings: SystemSetting[];
  categoryLabels: Record<string, string>;
  getCategoryName: (slug: string, type?: string) => string;
  getCategoryLabelsByType: (type: 'vehicle' | 'job' | 'supplier') => Record<string, string>;
  getSetting: (key: string, defaultValue?: any) => any;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const [cats, sets] = await Promise.allSettled([
        publicService.getCategories(),
        publicService.getSettings(),
      ]);
      setCategories(cats.status === 'fulfilled' ? cats.value : []);
      setSettings(sets.status === 'fulfilled' ? sets.value : []);
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Compute category labels map for quick lookup
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  const getCategoryName = (slug: string, type?: string) => {
    const category = categories.find(c => c.slug === slug && (!type || c.type === type));
    return category ? category.name : slug;
  };

  // Get category labels filtered by type (vehicle, job, or supplier)
  const getCategoryLabelsByType = (type: 'vehicle' | 'job' | 'supplier'): Record<string, string> => {
    const filtered = categories.filter(c => c.type === type);
    return filtered.reduce((acc, cat) => {
      acc[cat.slug] = cat.name;
      return acc;
    }, {} as Record<string, string>);
  };

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  return (
    <ConfigContext.Provider
      value={{
        categories,
        settings,
        categoryLabels,
        getCategoryName,
        getCategoryLabelsByType,
        getSetting,
        isLoading,
        refreshConfig: fetchConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
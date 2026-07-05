import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, MapPin, CheckCircle, Star, MessageCircle, Calendar, Lock, Share2, Crown } from 'lucide-react';
import type { Supplier } from '@/api/types';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useConfig } from '@/context/ConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MaskedContent } from '@/components/MaskedContent';
import { ShareButton } from '@/components/ShareButton';
import { ReportButton } from '@/components/ReportButton';
import toast from 'react-hot-toast';

interface SupplierCardProps {
  supplier: Supplier;
  onViewDetails?: () => void;
  showStatus?: boolean;
  disableNavigation?: boolean;
}

export function SupplierCard({ supplier, onViewDetails, showStatus = false, disableNavigation = false }: SupplierCardProps) {
  const { account } = useAuth();
  const navigate = useNavigate();
  const { categoryLabels, getCategoryLabelsByType } = useConfig();
  const supplierCategoryLabels = getCategoryLabelsByType('supplier');
  const isAuthenticated = !!account;
  const isPaid = supplier.isPaid ?? false;
  const isCompanyUser = account?.role === 'admin' || account?.role === 'sales' || account?.role === 'marketing';

  // Handle click on card
  const handleClick = () => {
    // If navigation is disabled (e.g. in admin pending approval view), do nothing
    if (disableNavigation) return;
    
    // If we have a details handler (on browse page), check for premium status
    if (onViewDetails) {
      if (!isPaid && !isCompanyUser) {
        toast.error('Detailed view is only available for featured vendors. Please contact admin for more info.');
        return;
      }
      onViewDetails();
    } else {
      // On landing page or other places without handler, redirect to suppliers directory
      navigate('/suppliers');
    }
  };

  // Only display rating/reviewCount when the supplier record actually carries them.
  const rating = typeof (supplier as any).rating === 'number' ? (supplier as any).rating.toFixed(1) : null;
  const reviewCount = typeof (supplier as any).reviewCount === 'number' ? (supplier as any).reviewCount : null;

  return (
    <div className={`relative group w-full ${disableNavigation ? 'cursor-default' : 'cursor-pointer'}`} onClick={handleClick}>
      <Card className={`overflow-hidden border border-[#0B1626]/15 shadow-none transition-all duration-300 rounded-md w-full h-full min-h-[192px] flex flex-col p-3 bg-white ${disableNavigation ? 'group-hover:shadow-[0_16px_32px_-20px_rgba(3,9,20,0.35)] group-hover:border-[#0B1626]/25' : 'group-hover:shadow-[0_16px_32px_-20px_rgba(3,9,20,0.45)] group-hover:border-[#0B1626]/35'}`}>
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="relative w-8 h-8 rounded-sm border border-[#0B1626]/15 overflow-hidden bg-[#F3F5F7] flex-shrink-0">
            {supplier.logo ? (
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#16857B]/[0.08] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#16857B]" />
              </div>
            )}
          </div>
          <div className="flex gap-1 items-center">
            {supplier.isVerified && <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-white" />}
            {isPaid && <Crown className="w-3.5 h-3.5 text-amber-500 fill-white" />}
            <ReportButton
              targetType="supplier"
              targetId={String(supplier.id || (supplier as any)._id)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow min-h-0">
          <h3 className="font-bold text-[13px] leading-tight line-clamp-1 text-[#0B1626] mb-0.5 group-hover:text-[#16857B] transition-colors flex items-center gap-1" title={supplier.name}>
            <span className="truncate">{supplier.name}</span>
            {/* TODO: Switch to vendor.verification.status === 'verified' once supplier list response is enriched */}
            {supplier.isVerified && <VerifiedBadge size="sm" label={false} />}
          </h3>
          
          {rating !== null && (
            <div className="flex items-center gap-1.5 mb-1">
              <div className="mx-mono flex items-center gap-0.5 text-[9px] font-bold text-[#A66B00] bg-[#FDF4E1] border border-[#F0A62B]/40 px-1 rounded-none">
                <span>{rating}</span>
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
              {reviewCount !== null && <span className="mx-mono text-[9px] text-[#0B1626]/50">{reviewCount} rev.</span>}
            </div>
          )}

          <div className="flex flex-col gap-0.5 text-[10px] text-[#0B1626]/55">
            {supplier.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-[#16857B]" />
                <span className="truncate">{supplier.address.city}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="mx-mono text-[8px] h-4 px-1 leading-none uppercase tracking-[0.08em] rounded-none border-[#0B1626]/15 bg-[#F3F5F7] text-[#0B1626]/70">
                {supplierCategoryLabels[supplier.category] || categoryLabels[supplier.category] || supplier.category}
              </Badge>
            </div>
          </div>

          <p className="text-[10px] text-[#0B1626]/55 line-clamp-2 leading-tight mt-1 mb-1">
            {supplier.description}
          </p>

          <div className="mt-auto">
            {disableNavigation ? (
              <div className="mx-mono w-full h-6 flex items-center justify-center bg-[#F3F5F7] border border-[#0B1626]/10 rounded-none text-[8px] text-[#0B1626]/55 font-medium uppercase tracking-[0.12em]">
                {supplier.status === 'pending' ? 'Pending Review' : supplier.status || 'Hover for actions'}
              </div>
            ) : isAuthenticated && isPaid ? (
              <Button
                size="sm"
                className="w-full text-[10px] h-6 rounded-sm bg-[#0B1626] hover:bg-[#13233A] text-white border-none shadow-none font-semibold transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Contact
              </Button>
            ) : !isPaid ? (
              <div className="mx-mono w-full h-6 flex items-center justify-center bg-[#FDF4E1] border border-[#F0A62B]/40 rounded-none text-[8px] text-[#A66B00] font-bold uppercase tracking-[0.18em]">
                Premium
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[10px] h-6 rounded-sm border-[#0B1626]/30 text-[#0B1626] shadow-none font-semibold hover:bg-[#0B1626] hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login');
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

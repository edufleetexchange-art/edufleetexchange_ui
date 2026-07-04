import { Vehicle } from '@/api/types';
import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Gauge, Calendar, Lock, Share2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MaskedContent } from '@/components/MaskedContent';
import { ShareButton } from '@/components/ShareButton';
import { ReportButton } from '@/components/ReportButton';

interface VehicleCardProps {
  vehicle: Vehicle;
  isListing?: boolean;
}

export function VehicleCard({ vehicle, isListing = false }: VehicleCardProps) {
  const { account } = useAuth();
  const { getCategoryName } = useConfig();
  const navigate = useNavigate();
  // Browse-level info (photos, price) is public: a guest must be able to
  // evaluate a vehicle before being asked to sign up. The gate lives at
  // contact/inquiry (ListingDetails), not at reading.
  const isUnmasked = true;

  const handleClick = () => {
    navigate(`/vehicle/${vehicle.id || (vehicle as any)._id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer relative group flex-shrink-0 w-full h-full"
    >
      <Card className="overflow-hidden border border-border/40 shadow-card hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-500 rounded-xl w-full h-full flex flex-col p-0 bg-card border-beam">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-muted/50 aspect-[4/3] flex-shrink-0">
          {!isUnmasked && !isListing ? (
            <MaskedContent variant="image" label="Login to view" className="w-full h-full">
              <img
                src={vehicle.images[0]}
                alt={vehicle.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
            </MaskedContent>
          ) : (
            <img
              src={vehicle.images[0]}
              alt={vehicle.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />
          )}
          
          {/* Status Badge Overlay for Owners */}
          {account && (account.id === vehicle.sellerId || (vehicle as any).sellerId === account.id) && vehicle.status !== 'approved' && (
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
              {vehicle.status === 'pending' && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center gap-1 shadow-md">
                  <Clock className="w-3 h-3" />
                  Pending Approval
                </Badge>
              )}
              {vehicle.status === 'rejected' && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-none flex items-center gap-1 shadow-md">
                  <AlertTriangle className="w-3 h-3" />
                  Rejected
                </Badge>
              )}
            </div>
          )}

          {/* Gradient Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {vehicle.isPriority && (
            <div className="absolute top-2 left-2 z-10">
              <PriorityBadge />
            </div>
          )}

          <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1">
            <ShareButton
              title={vehicle.title}
              text={`Check out this ${vehicle.manufacturer} ${vehicle.vehicleModel} on EduFleet Exchange!`}
              url={`/vehicle/${vehicle.id || (vehicle as any)._id}`}
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background"
            />
            <ReportButton
              targetType="vehicle"
              targetId={String(vehicle.id || (vehicle as any)._id)}
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow justify-between gap-3">
          <div className="min-h-0 space-y-2">
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors" title={vehicle.title}>
              {vehicle.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{vehicle.manufacturer}</span>
              <span className="w-1 h-1 rounded-full bg-border"></span>
              <span>{vehicle.year}</span>
            </div>
          </div>

          <div className="space-y-3 mt-auto pt-3 border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                {isUnmasked || isListing ? (
                  <div className="text-xl font-bold text-primary truncate">
                    ₹{(vehicle.price / 100000).toFixed(2)} L
                  </div>
                ) : (
                  <MaskedContent 
                    variant="text" 
                    label="Login to view price" 
                    className="text-xs font-semibold text-primary/70"
                  >
                    ₹{(vehicle.price / 100000).toFixed(2)} L
                  </MaskedContent>
                )}
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-md font-semibold border border-secondary/20">
                  {getCategoryName(vehicle.type, 'vehicle')}
                </span>
              </div>
            </div>
            
            {/* Professional Call to Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-9 font-semibold border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                View Details
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full text-xs h-9 font-semibold bg-accent hover:bg-accent-light text-accent-foreground border-none shadow-sm hover:shadow-md transition-all"
              >
                Enquire Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
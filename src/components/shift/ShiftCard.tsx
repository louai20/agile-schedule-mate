import React from 'react';
import { Clock, Calendar, MapPin, Users } from 'lucide-react';
import AnimatedCard from '../ui/AnimatedCard';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getShiftType } from './ShiftUtils';

interface Shift {
  ShiftID: string;
  StartTime: string;
  EndTime: string;
  ShiftStatus: string;
  RequiredSkill: string;
  created_at: string;
  location: string;
}

interface ShiftCardProps {
  shift: Shift;
  isSelected: boolean;
  onToggle: (shift: Shift) => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({ shift, isSelected, onToggle }) => {
  return (
    <AnimatedCard
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => onToggle(shift)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{getShiftType(shift.StartTime, shift.EndTime)}</h3>
        <Badge variant={shift.ShiftStatus === 'open' ? 'default' : 'secondary'}>
          {shift.ShiftStatus}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground mt-1">
        {shift.RequiredSkill}
      </div>
      
      <Separator className="my-3" />
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center text-sm">
          <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <span>
            {format(new Date(shift.StartTime), 'MMM d, yyyy')}
          </span>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <span>
            {format(new Date(shift.StartTime), 'HH:mm a')} - {format(new Date(shift.EndTime), 'HH:mm a')}
          </span>
        </div>
        
        <div className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <span>{shift.location}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Users className="h-3 w-3 mr-1.5 text-muted-foreground" />
          <span>-</span>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default ShiftCard;

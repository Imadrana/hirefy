'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onRoleSelect: (role: 'client' | 'professional') => void;
}

export function RoleSelectionModal({ 
  open, 
  onClose, 
  onRoleSelect 
}: RoleSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onRoleSelect('client')}
          >
            I'm a Client
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onRoleSelect('professional')}
          >
            I'm a Professional
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
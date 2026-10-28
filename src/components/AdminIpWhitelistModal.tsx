import React from 'react';
import { AdminUnifiedConfigModal } from './AdminUnifiedConfigModal';
import { IpCheckResult } from '../services/ipSecurityService';

export interface AdminIpWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipStatus: IpCheckResult;
  onUpdated: (newStatus: IpCheckResult) => void;
}

/**
 * AdminIpWhitelistModal now delegates to the unified AdminUnifiedConfigModal
 * on the 'ip' security tab.
 */
export const AdminIpWhitelistModal: React.FC<AdminIpWhitelistModalProps> = ({
  isOpen,
  onClose,
  ipStatus,
  onUpdated
}) => {
  return (
    <AdminUnifiedConfigModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab="ip"
      ipStatus={ipStatus}
      onIpUpdated={onUpdated}
    />
  );
};

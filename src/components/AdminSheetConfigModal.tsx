import React from 'react';
import {
  AdminUnifiedConfigModal,
  AdminMainTab,
  AdminSheetSubTab
} from './AdminUnifiedConfigModal';

export type AdminModuleTab = 'salary' | 'penalty' | 'barcode' | 'links' | 'ip' | 'history' | 'system';

export interface AdminSheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AdminModuleTab;
  onSuccessRefresh?: (tab: AdminModuleTab) => void;
}

/**
 * AdminSheetConfigModal now wraps the all-in-one AdminUnifiedConfigModal,
 * consolidating Google Sheet configs, IP security, and Barcode lookup history.
 */
export const AdminSheetConfigModal: React.FC<AdminSheetConfigModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'salary',
  onSuccessRefresh
}) => {
  return (
    <AdminUnifiedConfigModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab={initialTab}
      onSuccessRefresh={onSuccessRefresh as any}
    />
  );
};

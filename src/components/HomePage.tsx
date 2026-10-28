import React, { useState, useEffect } from 'react';

import iconViPham3d from '../assets/images/icon_vi_pham_3d.jpg';
import iconBarcode3d from '../assets/images/icon_barcode_3d.jpg';
import iconSalary3d from '../assets/images/icon_salary_3d.jpg';
import iconLinks3d from '../assets/images/icon_link_3d_blue.jpg';
import { getModuleVisibilityConfig, ModuleVisibilityConfig } from '../services/moduleVisibilityService';

interface HomePageProps {
  onNavigate: (nav: string, sub?: 'all' | 'shop-thuoc' | 'shop-ve-tinh') => void;
  onOpenAdminConfig?: (tab?: string) => void;
  onOpenZaloModal?: () => void;
  todayVisits?: number;
  totalVisits?: number;
}

interface ModuleItem {
  id: 'vi-pham' | 'barcode' | 'luong-thuong' | 'links' | 'minutes-files';
  title: string;
  icon3d: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenZaloModal }) => {
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibilityConfig>(() =>
    getModuleVisibilityConfig()
  );

  useEffect(() => {
    const handleVisibilityUpdate = () => {
      setModuleVisibility(getModuleVisibilityConfig());
    };
    window.addEventListener('ssc_module_visibility_changed', handleVisibilityUpdate);
    return () => window.removeEventListener('ssc_module_visibility_changed', handleVisibilityUpdate);
  }, []);

  const allModules: ModuleItem[] = [
    {
      id: 'vi-pham',
      title: 'Tra cứu Vi phạm',
      icon3d: iconViPham3d
    },
    {
      id: 'barcode',
      title: 'Tra cứu Barcode',
      icon3d: iconBarcode3d
    },
    {
      id: 'luong-thuong',
      title: 'Chính sách Lương thưởng',
      icon3d: iconSalary3d
    },
    {
      id: 'links',
      title: 'Danh sách link thường dùng',
      icon3d: iconLinks3d
    },
    {
      id: 'minutes-files',
      title: 'Biên bản & File',
      icon3d: iconLinks3d
    }
  ];

  // Filter modules based on current module visibility configuration (Default: vi-pham is false, barcode, links, minutes-files are true)
  const visibleModules = allModules.filter((m) => {
    if (m.id === 'vi-pham') return moduleVisibility['vi-pham'] === true; // explicitly hidden by default
    if (m.id === 'barcode') return moduleVisibility['barcode'] !== false;
    if (m.id === 'links') return moduleVisibility['links'] !== false;
    if (m.id === 'minutes-files') return moduleVisibility['minutes-files'] !== false;
    if (m.id === 'luong-thuong') return moduleVisibility['luong-thuong'] === true;
    return true;
  });

  return (
    <div className="w-full min-h-[55vh] flex flex-col items-center justify-center p-4 sm:p-8 bg-transparent">
      {/* Grid displaying 3D icon on top, module name below in black, transparent background */}
      <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-24 max-w-4xl mx-auto bg-transparent">
        {visibleModules.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className="group flex flex-col items-center justify-center bg-transparent border-0 outline-none cursor-pointer select-none transition-transform duration-300 hover:scale-108 active:scale-95 p-3 focus:outline-none"
            title={`Mở ${item.title}`}
          >
            {/* Icon 3D ở trên */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 flex items-center justify-center transition-all duration-300 group-hover:drop-shadow-2xl">
              <img
                src={item.icon3d}
                alt={item.title}
                className="w-full h-full object-contain rounded-2xl pointer-events-none drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                draggable={false}
              />
            </div>

            {/* Tên module bên dưới màu đen */}
            <span className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl font-black text-black dark:text-black tracking-tight text-center leading-snug uppercase transition-colors group-hover:text-blue-700">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

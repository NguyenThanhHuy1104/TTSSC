import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import {
  IconBoxSearch3D,
  IconBarcodeSearch3D,
  IconCalllogSearch3D,
  IconQrCode3D,
  IconRibbonBookmark3D,
  IconPingIpShop3D,
  IconLinkSearch3D,
  IconInfographic3D,
  IconSalaryCoins3D,
  IconLaptopMail3D,
  IconWeddingLeave3D,
  IconMedicalWarranty3D,
  IconInvoiceBill3D,
  IconInventoryCheck3D,
  IconReturnExchange3D,
  IconHealthInsurance3D,
  IconFastDelivery3D,
  IconCameraCctv3D,
  IconSecurityInside3D,
  IconPharmacyStore3D,
  IconTimeAttendance3D,
  IconCloudDrive3D,
  IconEducationCap3D,
  IconLawScales3D,
  IconSupportHeadset3D,
  IconPromotionGift3D,
  IconPrescriptionRx3D,
  IconBrowserPopup3D,
  IconChatMessages3D,
  IconGoogleSheet2D
} from './Link3dBlueIcons';
import { CommonLinkItem } from '../types';
import {
  fetchCommonLinksFromSheet,
  searchCommonLinks
} from '../services/commonLinksService';

interface CommonLinksLookupProps {
  onOpenAdminConfig?: (tab?: 'salary' | 'penalty' | 'barcode' | 'links') => void;
}

/**
 * Tự động phân tích tên đường link (title, url, category, description)
 * để gợi ý icon 2D màu xanh sắc nét, nền trong suốt theo đúng mẫu thiết kế
 */
export const renderLink2dBlueIcon = (item: CommonLinkItem) => {
  const norm = (str: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const text = norm(`${item.title} ${item.url} ${item.category || ''} ${item.description || ''}`);
  const iconCls = "w-14 h-14 sm:w-16 sm:h-16 drop-shadow-sm transition-transform duration-300 group-hover:scale-110";

  // 1. Phép cưới / Nghỉ cưới / Kết hôn / Hỷ sự (Cặp nhẫn cưới 2D màu xanh & vàng đính kim cương)
  if (
    text.includes('cuoi') ||
    text.includes('ket hon') ||
    text.includes('hy su') ||
    text.includes('phep cuoi') ||
    text.includes('dam cuoi')
  ) {
    return <IconWeddingLeave3D className={iconCls} />;
  }

  // 2. Bảo hành thiết bị y tế / Sửa chữa máy đo / Nhiệt kế / Huyết áp
  if (
    text.includes('bao hanh') ||
    (text.includes('thiet bi') && text.includes('y te')) ||
    text.includes('may do') ||
    text.includes('sua chua') ||
    text.includes('nhiet ke') ||
    text.includes('huyet ap')
  ) {
    return <IconMedicalWarranty3D className={iconCls} />;
  }

  // 3. Tra cứu Lô Date / Hạn dùng / Số lô thuốc
  if (
    text.includes('lo date') ||
    text.includes('date') ||
    text.includes('han dung') ||
    text.includes('so lo') ||
    text.includes('han su dung') ||
    text.includes('can date')
  ) {
    return <IconBoxSearch3D className={iconCls} />;
  }

  // 4. Tra cứu Barcode / Quét mã vạch / In tem / SKU
  if (
    text.includes('barcode') ||
    text.includes('ma vach') ||
    text.includes('in tem') ||
    text.includes('quet ma') ||
    text.includes('sku')
  ) {
    return <IconBarcodeSearch3D className={iconCls} />;
  }

  // 5. Tìm Calllog / Nhật ký cuộc gọi / Hotline / Tổng đài
  if (
    text.includes('calllog') ||
    text.includes('call log') ||
    text.includes('goi') ||
    text.includes('cuoc goi') ||
    text.includes('tong dai') ||
    text.includes('hotline') ||
    text.includes('ghi am')
  ) {
    return <IconCalllogSearch3D className={iconCls} />;
  }

  // 6. Lấy QR CODE / Quét mã QR / QR Pay
  if (
    text.includes('qr') ||
    text.includes('ma qr') ||
    text.includes('qr code') ||
    text.includes('quet qr')
  ) {
    return <IconQrCode3D className={iconCls} />;
  }

  // 7. Lối tắt link thường dùng / Tiện ích / Đánh dấu Bookmark
  if (
    text.includes('loi tat') ||
    text.includes('bookmark') ||
    text.includes('tien ich') ||
    text.includes('yeu thich') ||
    text.includes('quick link')
  ) {
    return <IconRibbonBookmark3D className={iconCls} />;
  }

  // 8. Ping IP Shop / Kiểm tra mạng nội bộ / Wifi / Server
  if (
    text.includes('ping') ||
    text.includes('ip') ||
    text.includes('server') ||
    text.includes('mang') ||
    text.includes('wifi') ||
    text.includes('ket noi')
  ) {
    return <IconPingIpShop3D className={iconCls} />;
  }

  // 9. Hóa đơn điện tử / e-Invoice / VAT
  if (
    text.includes('hoa don') ||
    text.includes('einvoice') ||
    text.includes('e-invoice') ||
    text.includes('vat') ||
    text.includes('bien lai') ||
    text.includes('chung tu')
  ) {
    return <IconInvoiceBill3D className={iconCls} />;
  }

  // 10. Kiểm kê tồn kho / Kho hàng / Hàng tồn
  if (
    text.includes('kiem ke') ||
    text.includes('ton kho') ||
    text.includes('kho hang') ||
    text.includes('kho duoc') ||
    text.includes('nhap kho') ||
    text.includes('xuat kho')
  ) {
    return <IconInventoryCheck3D className={iconCls} />;
  }

  // 11. Đổi trả hàng / Thu hồi / Hoàn tiền
  if (
    text.includes('doi tra') ||
    text.includes('tra hang') ||
    text.includes('hoan tien') ||
    text.includes('thu hoi') ||
    text.includes('refund') ||
    text.includes('return')
  ) {
    return <IconReturnExchange3D className={iconCls} />;
  }

  // 12. Bảo hiểm y tế BHYT / Chế độ bảo hiểm
  if (
    text.includes('bhyt') ||
    text.includes('bao hiem') ||
    text.includes('bhxh') ||
    text.includes('the bao hiem')
  ) {
    return <IconHealthInsurance3D className={iconCls} />;
  }

  // 13. Giao hàng nhanh Shop / Vận chuyển / Shipper
  if (
    text.includes('giao hang') ||
    text.includes('van chuyen') ||
    text.includes('ship') ||
    text.includes('hoa toc') ||
    text.includes('chuyen phat')
  ) {
    return <IconFastDelivery3D className={iconCls} />;
  }

  // 14. Hướng dẫn Infographic / Sơ đồ / Poster quy trình
  if (
    text.includes('infographic') ||
    text.includes('so do') ||
    text.includes('bieu do') ||
    text.includes('poster') ||
    (text.includes('huong dan') && !text.includes('link'))
  ) {
    return <IconInfographic3D className={iconCls} />;
  }

  // 15. Chính sách, Lương, Thưởng / Thu nhập / Hoa hồng
  if (
    text.includes('luong') ||
    text.includes('thuong') ||
    text.includes('chinh sach') ||
    text.includes('hoa hong') ||
    text.includes('thu nhap') ||
    text.includes('dai ngo')
  ) {
    return <IconSalaryCoins3D className={iconCls} />;
  }

  // 16. Camera giám sát an ninh
  if (text.includes('camera') || text.includes('cctv')) {
    return <IconCameraCctv3D className={iconCls} />;
  }

  // 17. Cài PM / Mail Outlook / Laptop / Phần mềm bán hàng
  if (
    text.includes('cai pm') ||
    text.includes('laptop') ||
    text.includes('phan mem') ||
    text.includes('mail') ||
    text.includes('outlook')
  ) {
    return <IconLaptopMail3D className={iconCls} />;
  }

  // 18. Mật khẩu / RSA / Inside / Identity / Đổi mật khẩu
  if (
    text.includes('mat khau') ||
    text.includes('rsa') ||
    text.includes('inside') ||
    text.includes('identity') ||
    text.includes('tai khoan') ||
    text.includes('bao mat') ||
    text.includes('dang nhap') ||
    text.includes('pass')
  ) {
    return <IconSecurityInside3D className={iconCls} />;
  }

  // 19. Website FPT Long Châu / Nhà thuốc / Dược phẩm
  if (
    text.includes('nha thuoc') ||
    text.includes('long chau') ||
    text.includes('duoc') ||
    text.includes('y te') ||
    text.includes('thuoc') ||
    text.includes('tiem chung') ||
    text.includes('duoc pham')
  ) {
    return <IconPharmacyStore3D className={iconCls} />;
  }

  // 20. HRM / Nhân sự / Chấm công / Ngày phép
  if (
    text.includes('hrm') ||
    text.includes('nhan su') ||
    text.includes('cham cong') ||
    text.includes('cbnv') ||
    text.includes('ngay phep') ||
    text.includes('hop dong')
  ) {
    return <IconTimeAttendance3D className={iconCls} />;
  }

  // 21. E-Learning / Đào tạo / SOP / Khóa học
  if (
    text.includes('elearning') ||
    text.includes('e-learning') ||
    text.includes('dao tao') ||
    text.includes('khoa hoc') ||
    text.includes('sop') ||
    text.includes('bai giang') ||
    text.includes('kiem tra')
  ) {
    return <IconEducationCap3D className={iconCls} />;
  }

  // 22. Google Sheet / Bảng tính / Spreadsheet / Excel
  if (
    text.includes('sheet') ||
    text.includes('bang tinh') ||
    text.includes('spreadsheet') ||
    text.includes('excel') ||
    text.includes('du lieu')
  ) {
    return <IconGoogleSheet2D className={iconCls} />;
  }

  // 23. Google Drive / Thư mục đám mây
  if (text.includes('drive') || text.includes('dam may') || text.includes('folder')) {
    return <IconCloudDrive3D className={iconCls} />;
  }

  // 24. Quy định vi phạm / Kỷ luật / Xử phạt SSC
  if (
    text.includes('vi pham') ||
    text.includes('xu phat') ||
    text.includes('ky luat') ||
    text.includes('che tai') ||
    text.includes('quy che')
  ) {
    return <IconLawScales3D className={iconCls} />;
  }

  // 25. Hỗ trợ SSC / Hotline 87333 / Chăm sóc khách hàng
  if (text.includes('87333') || text.includes('ho tro ssc') || text.includes('cskh')) {
    return <IconSupportHeadset3D className={iconCls} />;
  }

  // 26. Khuyến mãi / Quà tặng / Voucher
  if (text.includes('khuyen mai') || text.includes('qua tang') || text.includes('voucher')) {
    return <IconPromotionGift3D className={iconCls} />;
  }

  // 27. Đơn thuốc / Toa thuốc y tế Rx
  if (text.includes('don thuoc') || text.includes('toa thuoc') || text.includes('rx')) {
    return <IconPrescriptionRx3D className={iconCls} />;
  }

  // 28. Bỏ chặn popups / Trình duyệt Chrome
  if (text.includes('popup') || text.includes('chrome') || text.includes('trinh duyet')) {
    return <IconBrowserPopup3D className={iconCls} />;
  }

  // 29. Zalo / Tin nhắn / Chat
  if (text.includes('zalo') || text.includes('chat') || text.includes('tin nhan')) {
    return <IconChatMessages3D className={iconCls} />;
  }

  // Mặc định: Tra cứu Link (Mắt xích màu xanh + Kính lúp vàng viền vàng)
  return <IconLinkSearch3D className={iconCls} />;
};

export const CommonLinksLookup: React.FC<CommonLinksLookupProps> = () => {
  const [links, setLinks] = useState<CommonLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load links data on mount
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchCommonLinksFromSheet(false);
        if (isMounted) {
          setLinks(res.data);
        }
      } catch (err) {
        console.error('Failed to load links:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter links based on search query
  const filteredLinks = useMemo(() => {
    return searchCommonLinks(links, searchQuery, 'ALL');
  }, [links, searchQuery]);

  // Open link safely in new window
  const handleOpenLink = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetchCommonLinksFromSheet(true);
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to refresh links:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 bg-transparent">
      {/* Thanh tìm kiếm nhanh & Nút làm mới dữ liệu */}
      <div className="w-full max-w-2xl mx-auto mb-6 sm:mb-8 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm đường link thường dùng..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-55 shrink-0"
          title="Tải lại dữ liệu mới nhất từ Google Sheet"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Cập nhật link mới</span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-transparent">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Đang tải danh sách link thường dùng...</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-3 bg-transparent">
          <div className="w-12 h-12 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy đường link phù hợp
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        /* Grid thẻ: Icon 2D màu xanh ở trên, Tên đường link bên dưới, nền trong suốt, CÓ VIỀN CHO MỖI TRUY CẬP LINK, PHÓNG TO 100% TOÀN MÀN HÌNH */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4.5 w-full mx-auto bg-transparent">
          {filteredLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleOpenLink(item.url)}
              className="group flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-white/40 dark:bg-slate-900/40 hover:bg-blue-50/70 dark:hover:bg-slate-800/70 backdrop-blur-xs shadow-2xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer text-center min-h-[145px] sm:min-h-[165px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              title={`${item.title} — ${item.url}`}
            >
              {/* Icon 2D màu xanh ở trên, nền trong suốt 100% SVG */}
              <div className="flex-1 flex items-center justify-center w-full my-auto py-1">
                {renderLink2dBlueIcon(item)}
              </div>

              {/* Tên đường link bên dưới */}
              <span className="mt-2.5 text-xs sm:text-[13px] md:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 tracking-tight text-center leading-snug line-clamp-2 transition-colors">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

import { SalaryPolicyItem } from '../types';
import { prepareSearchIndex } from '../utils/vietnameseSearch';

export const DEFAULT_SALARY_POLICIES: SalaryPolicyItem[] = [
  {
    id: 'policy-1',
    title: 'Điểm thưởng tạo tài khoản gia đình',
    category: 'Chính sách thưởng',
    imageUrl: 'https://lh3.googleusercontent.com/d/1-SebK6JFWK7QyQo73__6JgkJMh8p1B1F',
    originalImageUrl: 'https://drive.google.com/file/d/1-SebK6JFWK7QyQo73__6JgkJMh8p1B1F/view?usp=drive_link',
    driveFileId: '1-SebK6JFWK7QyQo73__6JgkJMh8p1B1F',
    targetAudience: 'Toàn bộ Dược sĩ & Nhân viên Shop',
    summary: 'Chính sách tích điểm và cộng thưởng khi hướng dẫn khách hàng tạo và kích hoạt tài khoản gia đình thành công.',
    effectiveDate: '28/9/2026',
    detailUrl: 'https://drive.google.com/file/d/1-SebK6JFWK7QyQo73__6JgkJMh8p1B1F/view?usp=drive_link',
    badge: 'MỚI NHẤT',
    rawRowIndex: 1,
    searchIndex: prepareSearchIndex([
      'Điểm thưởng tạo tài khoản gia đình',
      'Chính sách thưởng',
      'Toàn bộ Dược sĩ & Nhân viên Shop',
      'Tài khoản gia đình',
      '28/9/2026'
    ])
  },
  {
    id: 'policy-2',
    title: 'Quy định tính Level dược sĩ',
    category: 'Quy định Level & Bậc lương',
    imageUrl: 'https://lh3.googleusercontent.com/d/1SZ5rUO7avGW-AOUX7PDzcSEuJVXxyiJN',
    originalImageUrl: 'https://drive.google.com/file/d/1SZ5rUO7avGW-AOUX7PDzcSEuJVXxyiJN/view?usp=drive_link',
    driveFileId: '1SZ5rUO7avGW-AOUX7PDzcSEuJVXxyiJN',
    targetAudience: 'Dược sĩ Nhà thuốc FPT Long Châu',
    summary: 'Bộ tiêu chí đánh giá năng lực, kỹ năng tư vấn chuyên môn và doanh số để xếp hạng level và mức lương tương ứng.',
    effectiveDate: '28/9/2026',
    detailUrl: 'https://drive.google.com/file/d/1SZ5rUO7avGW-AOUX7PDzcSEuJVXxyiJN/view?usp=drive_link',
    badge: 'TIÊU ĐIỂM',
    rawRowIndex: 2,
    searchIndex: prepareSearchIndex([
      'Quy định tính Level dược sĩ',
      'Quy định Level & Bậc lương',
      'Dược sĩ Nhà thuốc FPT Long Châu',
      '28/9/2026'
    ])
  },
  {
    id: 'policy-3',
    title: 'Thưởng tăng size',
    category: 'Thưởng Doanh số / KPI',
    imageUrl: 'https://lh3.googleusercontent.com/d/1pE75P8oA67c2qkORs92aAnajB90dn4dS',
    originalImageUrl: 'https://drive.google.com/file/d/1pE75P8oA67c2qkORs92aAnajB90dn4dS/view?usp=drive_link',
    driveFileId: '1pE75P8oA67c2qkORs92aAnajB90dn4dS',
    targetAudience: 'Dược sĩ & Nhân viên bán hàng',
    summary: 'Cơ chế tính thưởng nâng cao giá trị đơn hàng (up-size) cho các dòng sản phẩm trọng điểm và combo chăm sóc sức khỏe.',
    effectiveDate: '28/9/2026',
    detailUrl: 'https://drive.google.com/file/d/1pE75P8oA67c2qkORs92aAnajB90dn4dS/view?usp=drive_link',
    badge: 'THƯỞNG NÓNG',
    rawRowIndex: 3,
    searchIndex: prepareSearchIndex([
      'Thưởng tăng size',
      'Thưởng Doanh số / KPI',
      'Dược sĩ & Nhân viên bán hàng',
      '28/9/2026'
    ])
  },
  {
    id: 'policy-4',
    title: 'Chính sách thưởng KPI vệ tinh',
    category: 'Thưởng Doanh số / KPI',
    imageUrl: 'https://lh3.googleusercontent.com/d/1qrRJX5J61I_8__jgZrHn5qkkKIlp0_uz',
    originalImageUrl: 'https://drive.google.com/file/d/1qrRJX5J61I_8__jgZrHn5qkkKIlp0_uz/view?usp=drive_link',
    driveFileId: '1qrRJX5J61I_8__jgZrHn5qkkKIlp0_uz',
    targetAudience: 'Nhân sự Shop Vệ tinh',
    summary: 'Chỉ số KPI và hạn mức chi thưởng định kỳ cho đội ngũ cửa hàng vệ tinh hoàn thành mục tiêu tăng trưởng.',
    effectiveDate: '28/9/2026',
    detailUrl: 'https://drive.google.com/file/d/1qrRJX5J61I_8__jgZrHn5qkkKIlp0_uz/view?usp=drive_link',
    badge: 'VỆ TINH',
    rawRowIndex: 4,
    searchIndex: prepareSearchIndex([
      'Chính sách thưởng KPI vệ tinh',
      'Thưởng Doanh số / KPI',
      'Nhân sự Shop Vệ tinh',
      '28/9/2026'
    ])
  },
  {
    id: 'policy-5',
    title: 'Chính sách tăng hạ lương theo Level',
    category: 'Quy chế Lương',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NRUyf-S33zZbli44ZFBgsdEiMJIKSo-n',
    originalImageUrl: 'https://drive.google.com/file/d/1NRUyf-S33zZbli44ZFBgsdEiMJIKSo-n/view?usp=drive_link',
    driveFileId: '1NRUyf-S33zZbli44ZFBgsdEiMJIKSo-n',
    targetAudience: 'Toàn bộ nhân sự Dược sĩ',
    summary: 'Quy trình và điều kiện điều chỉnh tăng/giảm bậc lương theo kết quả đánh giá Level định kỳ hàng quý.',
    effectiveDate: '01/09/2026',
    detailUrl: 'https://drive.google.com/file/d/1NRUyf-S33zZbli44ZFBgsdEiMJIKSo-n/view?usp=drive_link',
    badge: 'QUY CHẾ',
    rawRowIndex: 5,
    searchIndex: prepareSearchIndex([
      'Chính sách tăng hạ lương theo Level',
      'Quy chế Lương',
      'Toàn bộ nhân sự Dược sĩ',
      '01/09/2026'
    ])
  },
  {
    id: 'policy-6',
    title: 'Chính sách thưởng Nhân viên shop vệ tinh',
    category: 'Chính sách thưởng',
    imageUrl: 'https://lh3.googleusercontent.com/d/1YZ2w431_VVQQm1WqjIDANX2L_hPoKo-I',
    originalImageUrl: 'https://drive.google.com/file/d/1YZ2w431_VVQQm1WqjIDANX2L_hPoKo-I/view?usp=drive_link',
    driveFileId: '1YZ2w431_VVQQm1WqjIDANX2L_hPoKo-I',
    targetAudience: 'Nhân viên cửa hàng vệ tinh',
    summary: 'Mức thưởng khuyến khích đặc thù dành cho nhân viên công tác tại các điểm bán và nhà thuốc vệ tinh.',
    effectiveDate: '01/03/2026',
    detailUrl: 'https://drive.google.com/file/d/1YZ2w431_VVQQm1WqjIDANX2L_hPoKo-I/view?usp=drive_link',
    badge: 'SHOP VỆ TINH',
    rawRowIndex: 6,
    searchIndex: prepareSearchIndex([
      'Chính sách thưởng Nhân viên shop vệ tinh',
      'Chính sách thưởng',
      'Nhân viên cửa hàng vệ tinh',
      '01/03/2026'
    ])
  }
];

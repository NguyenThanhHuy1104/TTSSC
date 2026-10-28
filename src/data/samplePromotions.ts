import { ProductItem, PromotionRoundKey } from '../types';

export const ISLAND_METADATA = [
  { number: 1, name: 'Đảo 1', badge: '', color: 'from-cyan-500 to-blue-600', icon: 'Compass' },
  { number: 2, name: 'Đảo 2', badge: '', color: 'from-amber-500 to-orange-600', icon: 'Zap' },
  { number: 3, name: 'Đảo 3', badge: '', color: 'from-pink-500 to-rose-600', icon: 'Sparkles' },
  { number: 4, name: 'Đảo 4', badge: '', color: 'from-emerald-500 to-teal-600', icon: 'Heart' },
  { number: 5, name: 'Đảo 5', badge: '', color: 'from-yellow-500 to-amber-600', icon: 'Shield' },
  { number: 6, name: 'Đảo 6', badge: '', color: 'from-blue-500 to-indigo-600', icon: 'Activity' },
  { number: 7, name: 'Đảo 7', badge: '', color: 'from-green-600 to-emerald-700', icon: 'Leaf' },
  { number: 8, name: 'Đảo 8', badge: '', color: 'from-purple-500 to-indigo-600', icon: 'Box' },
  { number: 9, name: 'Đảo 9', badge: '', color: 'from-red-500 to-rose-700', icon: 'Smile' },
  { number: 10, name: 'Đảo 10', badge: '', color: 'from-teal-500 to-cyan-600', icon: 'Cross' },
  { number: 11, name: 'Đảo 11', badge: '', color: 'from-violet-600 to-purple-800', icon: 'Gift' },
  { number: 12, name: 'Đảo 12', badge: '', color: 'from-amber-600 to-yellow-500', icon: 'Trophy' }
];

export const SAMPLE_PROMOTION_PRODUCTS: Record<PromotionRoundKey, ProductItem[]> = {
  dot1: [
    // Đảo 1
    {
      id: 'd1-hop-chia-thuoc',
      maSanPham: '00056890',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00056890',
      tenSanPham: 'HỘP CHIA THUỐC THÔNG MINH 7 NGÀY FPT LONG CHÂU',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày kháng khuẩn FPT Long Châu',
      moTa: 'Tặng ngay hộp chia thuốc tiện dụng khi mua đơn hàng tại Đảo 1',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng biểu trưng Đảo 1',
      islandNumber: 1
    },
    {
      id: 'd1-1',
      maSanPham: '00015165',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00015165',
      tenSanPham: 'NƯỚC BÙ ĐIỆN GIẢI POCARI SWEAT 500ML',
      quaTang: 'Tặng 1 ly sứ Long Châu cao cấp',
      moTa: 'Mua từ 4 chai trở lên hoặc hóa đơn kèm sản phẩm',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Áp dụng trên toàn hệ thống nhà thuốc FPT Long Châu',
      islandNumber: 1
    },
    {
      id: 'd1-2',
      maSanPham: '00028491',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00028491',
      tenSanPham: 'VIÊN SỦI BEROCCA PERFORMANCE MANGO HỘP 10 VIÊN',
      quaTang: 'Tặng bình nước thể thao 600ml Lock&Lock',
      moTa: 'Tặng kèm khi mua từ 2 tuýp Berocca bất kỳ',
      mocChiTieu: 'Hóa đơn từ 200.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Số lượng quà tặng có hạn theo từng cửa hàng',
      islandNumber: 1
    },
    // Đảo 2
    {
      id: 'd1-3',
      maSanPham: '00034102',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00034102',
      tenSanPham: 'SỮA BỘT ENSURE GOLD ABBOTT VANI 850G',
      quaTang: 'Tặng 1 bình giữ nhiệt inox Elmich 500ml',
      moTa: 'Tặng ngay 1 bình giữ nhiệt cao cấp khi mua 2 lon Ensure Gold 850g',
      mocChiTieu: 'Hóa đơn từ 850.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Tích lũy điểm thưởng SSC x2',
      islandNumber: 2
    },
    {
      id: 'd1-4',
      maSanPham: '00019283',
      tenSanPham: 'NƯỚC YẾN SÀO CAO CẤP SANEST KHÁNH HÒA HỘP 6 LỌ',
      quaTang: 'Tặng 1 hộp trà Atiso túi lọc Ladophar',
      moTa: 'Mua 1 hộp Sanest 6 lọ tặng ngay hộp trà thanh nhiệt',
      mocChiTieu: 'Hóa đơn từ 300.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Thích hợp làm quà biếu tặng sức khỏe',
      islandNumber: 2
    },
    // Đảo 3
    {
      id: 'd1-5',
      maSanPham: '00045190',
      tenSanPham: 'KEM CHỐNG NẮNG LA ROCHE-POSAY ANTHELIOS XL 50ML',
      quaTang: 'Tặng 1 túi cói du lịch xinh xắn + Mini sữa rửa mặt 50ml',
      moTa: 'Áp dụng cho dòng chống nắng kiểm soát dầu La Roche-Posay',
      mocChiTieu: 'Hóa đơn từ 450.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Dược mỹ phẩm chính hãng Pháp',
      islandNumber: 3
    },
    {
      id: 'd1-6',
      maSanPham: '00051284',
      tenSanPham: 'SỮA RỬA MẶT CETAPHIL GENTLE SKIN CLEANSER 500ML',
      quaTang: 'Tặng 1 khăn mặt sợi tre kháng khuẩn',
      moTa: 'Dành cho làn da nhạy cảm, tặng kèm khăn lau mặt cao cấp',
      mocChiTieu: 'Hóa đơn từ 350.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Độc quyền tại chuỗi Long Châu',
      islandNumber: 3
    },
    // Đảo 4
    {
      id: 'd1-7',
      maSanPham: '00062839',
      tenSanPham: 'MEN VI SINH BIOGAIA PROTECTIS BABY DROPS 5ML',
      quaTang: 'Tặng gấu bông Long Châu phiên bản Bác Sĩ Nhí',
      moTa: 'Mua 1 lọ BioGaia hỗ trợ tiêu hóa cho bé nhận ngay gấu bông',
      mocChiTieu: 'Hóa đơn từ 390.000đ',
      dao: 'Đảo 4',
      ghiChu: 'Hàng nhập khẩu Thụy Điển chính hãng',
      islandNumber: 4
    },
    // Đảo 5
    {
      id: 'd1-8',
      maSanPham: '00071928',
      tenSanPham: 'VIÊN UỐNG DẦU CÁ OMEGA 3 KIRKLAND SIGNATURE 400 VIÊN',
      quaTang: 'Tặng 1 hộp chia thuốc thông minh 7 ngày',
      moTa: 'Mua 1 hộp Omega 3 Kirkland hỗ trợ tim mạch và mắt',
      mocChiTieu: 'Hóa đơn từ 420.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Nhập khẩu Hoa Kỳ',
      islandNumber: 5
    },
    // Đảo 6
    {
      id: 'd1-9',
      maSanPham: '00083912',
      tenSanPham: 'XỊT LẠNH GIẢM ĐAU STARBALM COLD SPRAY 150ML',
      quaTang: 'Tặng băng thun quấn thể thao co giãn 5cm',
      moTa: 'Giảm đau cơ tức thì sau vận động',
      mocChiTieu: 'Hóa đơn từ 180.000đ',
      dao: 'Đảo 6',
      ghiChu: 'Sản xuất tại Hà Lan',
      islandNumber: 6
    },
    // Đảo 7
    {
      id: 'd1-10',
      maSanPham: '00094821',
      tenSanPham: 'SI RÔ THIÊN MÔN BỔ PHỔI BÌNH ĐÔNG CHAI 280ML',
      quaTang: 'Tặng 1 vỉ kẹo ngậm ho thảo dược',
      moTa: 'Hỗ trợ nhuận phế, giảm ho, bổ phổi tự nhiên',
      mocChiTieu: 'Hóa đơn từ 120.000đ',
      dao: 'Đảo 7',
      ghiChu: 'Thảo dược truyền thống Việt Nam',
      islandNumber: 7
    },
    // Đảo 8
    {
      id: 'd1-11',
      maSanPham: '00102938',
      tenSanPham: 'KHẨU TRANG Y TẾ 4D KF94 LONG CHÂU HỘP 30 CÁI',
      quaTang: 'Tặng 1 chai cồn xịt khuẩn 70 độ 100ml',
      moTa: 'Combo bảo vệ hô hấp hằng ngày',
      mocChiTieu: 'Hóa đơn từ 90.000đ',
      dao: 'Đảo 8',
      ghiChu: 'Sản phẩm tiêu chuẩn y tế',
      islandNumber: 8
    },
    // Đảo 9
    {
      id: 'd1-12',
      maSanPham: '00114920',
      tenSanPham: 'MÁY ĐO HUYẾT ÁP BẮP TAY TỰ ĐỘNG OMRON HEM-7120',
      quaTang: 'Tặng nhiệt kế điện tử Omron + Phiếu kiểm tra sức khỏe miễn phí',
      moTa: 'Bảo hành 5 năm chính hãng Omron Nhật Bản',
      mocChiTieu: 'Hóa đơn từ 850.000đ',
      dao: 'Đảo 9',
      ghiChu: 'Tặng phiếu đo huyết áp định kỳ tại nhà thuốc',
      islandNumber: 9
    },
    // Đảo 10
    {
      id: 'd1-13',
      maSanPham: '00125819',
      tenSanPham: 'VIÊN NÉN PANADOL EXTRA ĐỎ HỘP 180 VIÊN',
      quaTang: 'Tặng 1 nhiệt kế dán đo sốt tiện lợi',
      moTa: 'Tủ thuốc gia đình không thể thiếu khi cảm sốt, đau đầu',
      mocChiTieu: 'Hóa đơn từ 250.000đ',
      dao: 'Đảo 10',
      ghiChu: 'Đọc kỹ hướng dẫn sử dụng trước khi dùng',
      islandNumber: 10
    },
    // Đảo 11
    {
      id: 'd1-14',
      maSanPham: '00136928',
      tenSanPham: 'COMBO CHĂM SÓC TOÀN DIỆN MÙA HÈ FPT LONG CHÂU',
      quaTang: 'Tặng Nồi chiên không dầu Lock&Lock 3.5L hoặc Bộ nồi Inox Elmich',
      moTa: 'Dành cho khách hàng tích lũy mua sắm sản phẩm chăm sóc gia đình',
      mocChiTieu: 'Hóa đơn từ 2.500.000đ',
      dao: 'Đảo 11',
      ghiChu: 'Giao quà tận nhà miễn phí toàn quốc',
      islandNumber: 11
    },
    // Đảo 12
    {
      id: 'd1-15',
      maSanPham: '00147819',
      tenSanPham: 'VÉ THAM GIA ĐẠI TIỆC VÒNG QUAY MAY MẮN VỀ ĐÍCH',
      quaTang: 'Cơ hội trúng 1 Chỉ Vàng 9999 PNJ hoặc Xe Máy Honda Wave',
      moTa: 'Mỗi 500k chi tiêu nhận ngay 1 mã quay thưởng may mắn cuối đợt',
      mocChiTieu: 'Hóa đơn từ 500.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Quay số trực tiếp trên Fanpage FPT Long Châu',
      islandNumber: 12
    }
  ],
  dot2: [
    {
      id: 'd2-hop-chia-thuoc',
      maSanPham: '00056890',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00056890',
      tenSanPham: 'HỘP CHIA THUỐC THÔNG MINH 7 NGÀY FPT LONG CHÂU',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày kháng khuẩn FPT Long Châu',
      moTa: 'Tặng ngay hộp chia thuốc tiện dụng khi mua đơn thuốc hoặc sản phẩm chăm sóc sức khỏe Đảo 1',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng thiết thực Đảo 1 Khởi Hành',
      islandNumber: 1
    },
    {
      id: 'd2-1',
      maSanPham: '00015165',
      tenSanPham: 'NƯỚC BÙ ĐIỆN GIẢI POCARI SWEAT 500ML',
      quaTang: 'Tặng khăn thể thao thấm hút mồ hôi siêu êm',
      moTa: 'Mua combo 6 chai tặng khăn thể thao chuyên dụng',
      mocChiTieu: 'Hóa đơn từ 160.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Áp dụng xuyên suốt Đợt 2',
      islandNumber: 1
    },
    {
      id: 'd2-2',
      maSanPham: '00028491',
      tenSanPham: 'VIÊN SỦI BEROCCA PERFORMANCE VỊ CAM HỘP 10 VIÊN',
      quaTang: 'Tặng 1 túi tote canvas Long Châu thời trang',
      moTa: 'Nạp năng lượng tức thì cho ngày dài năng động',
      mocChiTieu: 'Hóa đơn từ 220.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng giao ngay tại quầy',
      islandNumber: 1
    },
    {
      id: 'd2-3',
      maSanPham: '00034102',
      tenSanPham: 'SỮA BỘT ENSURE GOLD CÀ PHÊ 850G',
      quaTang: 'Tặng 1 máy đánh trứng cầm tay + Bình lắc sữa tiện lợi',
      moTa: 'Vị cà phê thơm ngon bồi bổ thể chất',
      mocChiTieu: 'Hóa đơn từ 870.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Quà tặng cao cấp cho người lớn tuổi',
      islandNumber: 2
    },
    {
      id: 'd2-4',
      maSanPham: '00045190',
      tenSanPham: 'KEM DƯỠNG PHỤC HỒI B5 LA ROCHE-POSAY CICAPLAST 40ML',
      quaTang: 'Tặng gương trang điểm cầm tay có đèn LED',
      moTa: 'Phục hồi màng ẩm cho da kích ứng, nứt nẻ mùa nắng',
      mocChiTieu: 'Hóa đơn từ 380.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Sản phẩm được chuyên gia da liễu khuyên dùng',
      islandNumber: 3
    },
    {
      id: 'd2-5',
      maSanPham: '00062839',
      tenSanPham: 'BÌNH SỮA PIGEON NỘI ĐỊA NHẬT CỔ RỘNG 240ML',
      quaTang: 'Tặng 1 cọ rửa bình sữa silicon chuyên dụng',
      moTa: 'Bình sữa chống sặc an toàn cho bé yêu',
      mocChiTieu: 'Hóa đơn từ 350.000đ',
      dao: 'Đảo 4',
      ghiChu: 'Chất liệu PPSU an toàn tuyệt đối',
      islandNumber: 4
    },
    {
      id: 'd2-6',
      maSanPham: '00071928',
      tenSanPham: 'VIÊN UỐNG BỔ XƯƠNG KHỚP GLUCOSAMINE ORIHIRO 900 VIÊN',
      quaTang: 'Tặng 1 dầu xoa bóp thảo dược Hàn Quốc Antiphlamine',
      moTa: 'Bổ sung sụn khớp cho người thoái hóa khớp',
      mocChiTieu: 'Hóa đơn từ 650.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Hàng nội địa Nhật Bản',
      islandNumber: 5
    },
    {
      id: 'd2-7',
      maSanPham: '00114920',
      tenSanPham: 'MÁY ĐO ĐƯỜNG HUYẾT ACCU-CHEK INSTANT',
      quaTang: 'Tặng hộp 25 que thử đường huyết + 25 kim lấy máu',
      moTa: 'Kiểm soát đường huyết nhanh chóng, chính xác tại nhà',
      mocChiTieu: 'Hóa đơn từ 1.100.000đ',
      dao: 'Đảo 9',
      ghiChu: 'Bảo hành vĩnh viễn',
      islandNumber: 9
    },
    {
      id: 'd2-8',
      maSanPham: '00136928',
      tenSanPham: 'SIÊU COMBO GIA ĐÌNH BÙNG NỔ THÁNG 6',
      quaTang: 'Tặng Quạt đứng lửng Senko hoặc Nồi cơm điện Sharp 1.8L',
      moTa: 'Tích lũy mua hàng trị giá trên 3 triệu',
      mocChiTieu: 'Hóa đơn từ 3.000.000đ',
      dao: 'Đảo 11',
      ghiChu: 'Áp dụng cho khách hàng thành viên SSC',
      islandNumber: 11
    },
    {
      id: 'd2-9',
      maSanPham: '00147819',
      tenSanPham: 'VÉ VÀNG VỀ ĐÍCH ĐỢT 2',
      quaTang: 'Giải thưởng Robot hút bụi Ecovacs Deebot',
      moTa: 'Quay số may mắn tự động sau khi kết thúc đợt 2',
      mocChiTieu: 'Hóa đơn từ 500.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Tra cứu mã dự thưởng tại hệ thống SSC',
      islandNumber: 12
    }
  ],
  dot3: [
    // Đợt 3: Đỉnh cao ưu đãi - có AI bot hỗ trợ tra cứu
    {
      id: 'd3-hop-chia-thuoc',
      maSanPham: '00056890',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00056890',
      tenSanPham: 'HỘP CHIA THUỐC THÔNG MINH 7 NGÀY FPT LONG CHÂU',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày kháng khuẩn FPT Long Châu',
      moTa: 'Tặng ngay hộp chia thuốc tiện dụng khi mua đơn hàng tại Đảo 1',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng thiết thực Đảo 1',
      islandNumber: 1
    },
    {
      id: 'd3-1',
      maSanPham: '00015165',
      tenSanPham: 'NƯỚC BÙ ĐIỆN GIẢI POCARI SWEAT 500ML',
      quaTang: 'Tặng 1 ly giữ nhiệt mini Long Châu inox 304',
      moTa: 'Combo 6 chai Pocari giải nhiệt mùa hè',
      mocChiTieu: 'Hóa đơn từ 180.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Sản phẩm Best-Seller Đợt 3',
      islandNumber: 1
    },
    {
      id: 'd3-2',
      maSanPham: '00028491',
      tenSanPham: 'VIÊN SỦI BEROCCA PERFORMANCE HỘP 20 VIÊN',
      quaTang: 'Tặng túi đeo chéo thể thao phong cách SSC',
      moTa: 'Tăng cường sức đề kháng với Vitamin nhóm B & C',
      mocChiTieu: 'Hóa đơn từ 280.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Sản xuất tại Indonesia',
      islandNumber: 1
    },
    {
      id: 'd3-3',
      maSanPham: '00034102',
      tenSanPham: 'SỮA BỘT GLUCERNA ABBOTT CHO NGƯỜI TIỂU ĐƯỜNG 850G',
      quaTang: 'Tặng 1 ấm đun siêu tốc inox 1.8L Sunhouse',
      moTa: 'Dinh dưỡng chuyên biệt kiểm soát đường huyết',
      mocChiTieu: 'Hóa đơn từ 890.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Quà tặng trao tay khi nhận sữa',
      islandNumber: 2
    },
    {
      id: 'd3-4',
      maSanPham: '00045190',
      tenSanPham: 'TINH CHẤT SERUM CHỐNG NẮNG VICHY CAPITAL SOLEIL 50ML',
      quaTang: 'Tặng 1 dù cầm tay gấp gọn chống tia UV thời thượng',
      moTa: 'Bảo vệ da khỏi tác động ánh nắng gay gắt',
      mocChiTieu: 'Hóa đơn từ 520.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Thương hiệu dược mỹ phẩm hàng đầu',
      islandNumber: 3
    },
    {
      id: 'd3-5',
      maSanPham: '00051284',
      tenSanPham: 'NƯỚC TẨY TRANG BIODERMA HỒNG SENSIBIO H2O 500ML',
      quaTang: 'Tặng 1 hộp bông tẩy trang Ipek Thổ Nhĩ Kỳ 150 miếng',
      moTa: 'Làm sạch sâu dịu nhẹ không gây rát da',
      mocChiTieu: 'Hóa đơn từ 420.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Sản phẩm được mua nhiều nhất',
      islandNumber: 3
    },
    {
      id: 'd3-6',
      maSanPham: '00062839',
      tenSanPham: 'TÃ DÁN CAO CẤP MOONY NATURAL SIZE M 46 MIẾNG',
      quaTang: 'Tặng 1 thảm tập bò cho bé êm ái chống thấm',
      moTa: 'Chăm sóc làn da nhạy cảm của trẻ sơ sinh',
      mocChiTieu: 'Hóa đơn từ 380.000đ',
      dao: 'Đảo 4',
      ghiChu: 'Bông hữu cơ cao cấp từ Nhật',
      islandNumber: 4
    },
    {
      id: 'd3-7',
      maSanPham: '00071928',
      tenSanPham: 'VIÊN UỐNG CANXI VÀ VITAMIN D3 OSTELIN HỘP 130 VIÊN',
      quaTang: 'Tặng 1 hộp xịt họng keo ong Propolis Úc',
      moTa: 'Tăng mật độ xương, phòng ngừa loãng xương',
      mocChiTieu: 'Hóa đơn từ 450.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Thương hiệu Canxi số 1 tại Úc',
      islandNumber: 5
    },
    {
      id: 'd3-8',
      maSanPham: '00083912',
      tenSanPham: 'CAO DÁN GIẢM ĐAU SALONPAS HỘP 20 MIẾNG',
      quaTang: 'Tặng 1 chai dầu gió xanh con ó Eagle Brand 24ml',
      moTa: 'Giảm nhanh cơn đau mỏi vai gáy và cơ bắp',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 6',
      ghiChu: 'Tiện lợi mang theo khi du lịch, tập gym',
      islandNumber: 6
    },
    {
      id: 'd3-9',
      maSanPham: '00094821',
      tenSanPham: 'DẦU TRÀM CUNG ĐÌNH NGUYÊN CHẤT HUẾ 100ML',
      quaTang: 'Tặng 1 gói ngâm chân thảo dược cung đình',
      moTa: 'Giữ ấm cơ thể cho mẹ và bé, xua đuổi côn trùng',
      mocChiTieu: 'Hóa đơn từ 160.000đ',
      dao: 'Đảo 7',
      ghiChu: '100% tinh dầu tràm tự nhiên',
      islandNumber: 7
    },
    {
      id: 'd3-10',
      maSanPham: '00102938',
      tenSanPham: 'NƯỚC RỬA TAY KHÔ DIỆT KHUẨN LIFEBUOY 500ML',
      quaTang: 'Tặng 1 tuýp gel rửa tay mini bỏ túi 50ml',
      moTa: 'Kháng khuẩn 99.9% vi khuẩn có hại',
      mocChiTieu: 'Hóa đơn từ 110.000đ',
      dao: 'Đảo 8',
      ghiChu: 'Bảo vệ sức khỏe cả gia đình',
      islandNumber: 8
    },
    {
      id: 'd3-11',
      maSanPham: '00114920',
      tenSanPham: 'MÁY ĐO HUYẾT ÁP BẮP TAY CAO CẤP OMRON HEM-7361T',
      quaTang: 'Tặng bộ quà tặng Vàng Sức Khỏe trị giá 500.000đ',
      moTa: 'Kết nối Bluetooth với điện thoại thông minh, tầm soát rung nhĩ Afib',
      mocChiTieu: 'Hóa đơn từ 1.850.000đ',
      dao: 'Đảo 9',
      ghiChu: 'Công nghệ tiên tiến nhất từ Omron',
      islandNumber: 9
    },
    {
      id: 'd3-12',
      maSanPham: '00125819',
      tenSanPham: 'MEN VI SINH ENTEROGERMINA 4 TỶ BÀO TỬ HỘP 20 ỐNG',
      quaTang: 'Tặng 1 cốc đong nước thuốc chia vạch chính xác',
      moTa: 'Phục hồi hệ vi sinh đường ruột khi uống kháng sinh',
      mocChiTieu: 'Hóa đơn từ 290.000đ',
      dao: 'Đảo 10',
      ghiChu: 'Nhập khẩu chính hãng Sanofi Pháp',
      islandNumber: 10
    },
    {
      id: 'd3-13',
      maSanPham: '00136928',
      tenSanPham: 'BỘ QUÀ TẶNG BÙNG NỔ ĐỈNH CAO ĐỢT 3',
      quaTang: 'Tặng Vali kéo du lịch 20 inch chống xước hoặc Bếp từ đơn Midea',
      moTa: 'Tích lũy hóa đơn Đợt 3 đạt mốc quy định',
      mocChiTieu: 'Hóa đơn từ 3.500.000đ',
      dao: 'Đảo 11',
      ghiChu: 'Số lượng 500 phần quà trên toàn quốc',
      islandNumber: 11
    },
    {
      id: 'd3-14',
      maSanPham: '00147819',
      tenSanPham: 'VÉ DỰ THƯỞNG ĐẠI TIỆC VỀ ĐÍCH ĐỢT 3',
      quaTang: 'Giải Đặc Biệt: Chuyến du lịch Thái Lan 5N4Đ dành cho 2 người',
      moTa: 'Mỗi 500k chi tiêu nhận ngay 1 mã quay số điện tử',
      mocChiTieu: 'Hóa đơn từ 500.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Livestream công bố kết quả vào ngày 18/07',
      islandNumber: 12
    }
  ],
  dot5: [
    // Đảo 1
    {
      id: 'd5-1-hop-chia-thuoc',
      maSanPham: '00056890',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00056890',
      tenSanPham: 'HỘP CHIA THUỐC THÔNG MINH 7 NGÀY FPT LONG CHÂU',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày kháng khuẩn FPT Long Châu',
      moTa: 'Tặng ngay khi mua đơn thuốc theo toa hoặc hóa đơn thực phẩm bảo vệ sức khỏe tại Đảo 1',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng biểu trưng Đảo 1 Khởi Hành',
      islandNumber: 1
    },
    {
      id: 'd5-1',
      maSanPham: '00015165',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00015165',
      tenSanPham: 'NƯỚC BÙ ĐIỆN GIẢI POCARI SWEAT 500ML',
      quaTang: 'Tặng huy hiệu Về Đích Rực Rỡ + Bình nước thể thao Lock&Lock',
      moTa: 'Vòng chung kết săn quà tặng toàn quốc, mua từ 4 chai hoặc kèm hóa đơn',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Đợt tri ân cao điểm Đợt 5',
      islandNumber: 1
    },
    {
      id: 'd5-1b',
      maSanPham: '00028491',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00028491',
      tenSanPham: 'VIÊN SỦI BEROCCA PERFORMANCE MANGO HỘP 10 VIÊN',
      quaTang: 'Tặng 1 bình giữ nhiệt Elmich Inox 500ml cao cấp',
      moTa: 'Năng lượng bứt phá chặng về đích, mua từ 2 tuýp nhận quà ngay',
      mocChiTieu: 'Hóa đơn từ 200.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Quà tặng giao ngay tại nhà thuốc',
      islandNumber: 1
    },
    {
      id: 'd5-1c',
      maSanPham: '00019283',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00019283',
      tenSanPham: 'NƯỚC YẾN SÀO CAO CẤP SANEST KHÁNH HÒA HỘP 6 LỌ',
      quaTang: 'Tặng 1 lốc yến dinh dưỡng bổ sung + Túi quà Tết tri ân',
      moTa: 'Bồi bổ thể lực chặng Khởi Hành Đợt 5',
      mocChiTieu: 'Hóa đơn từ 300.000đ',
      dao: 'Đảo 1',
      ghiChu: 'Số lượng quà tặng có hạn',
      islandNumber: 1
    },
    // Đảo 2
    {
      id: 'd5-2a',
      maSanPham: '00034102',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00034102',
      tenSanPham: 'SỮA BỘT ENSURE GOLD ABBOTT VANI 850G',
      quaTang: 'Tặng Nồi chiên không dầu Philips 4.1L cao cấp',
      moTa: 'Tặng quà đặc biệt khi mua combo 3 lon Ensure Gold 850g',
      mocChiTieu: 'Hóa đơn từ 1.200.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Áp dụng trên toàn quốc',
      islandNumber: 2
    },
    {
      id: 'd5-2b',
      maSanPham: '00034108',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00034108',
      tenSanPham: 'SỮA DINH DƯỠNG Y HỌC ANLENE GOLD 5X 800G',
      quaTang: 'Tặng Chảo chống dính Tefal 24cm cao cấp',
      moTa: 'Bổ sung canxi và collagen cho người lớn tuổi, mua từ 2 lon',
      mocChiTieu: 'Hóa đơn từ 650.000đ',
      dao: 'Đảo 2',
      ghiChu: 'Quà tặng nhà bếp cao cấp',
      islandNumber: 2
    },
    // Đảo 3
    {
      id: 'd5-3a',
      maSanPham: '00045190',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00045190',
      tenSanPham: 'KEM CHỐNG NẮNG LA ROCHE-POSAY ANTHELIOS XL 50ML',
      quaTang: 'Tặng Bộ cọ trang điểm cao cấp 8 món + Túi đựng mỹ phẩm',
      moTa: 'Dành riêng cho khách hàng mua dược mỹ phẩm chăm sóc da',
      mocChiTieu: 'Hóa đơn từ 500.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Số lượng quà có hạn',
      islandNumber: 3
    },
    {
      id: 'd5-3b',
      maSanPham: '00045195',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00045195',
      tenSanPham: 'NƯỚC TẨY TRANG BIODERMA SENSIBIO H2O CHAI 500ML',
      quaTang: 'Tặng Hộp bông tẩy trang cao cấp 222 miếng + Khăn ướt kháng khuẩn',
      moTa: 'Làm sạch dịu nhẹ cho da nhạy cảm, mua từ 1 chai 500ml',
      mocChiTieu: 'Hóa đơn từ 350.000đ',
      dao: 'Đảo 3',
      ghiChu: 'Chính hãng Bioderma Pháp',
      islandNumber: 3
    },
    // Đảo 4
    {
      id: 'd5-4a',
      maSanPham: '00062839',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00062839',
      tenSanPham: 'MEN VI SINH BIOGAIA PROTECTIS BABY DROPS 5ML',
      quaTang: 'Tặng Xe chòi chân phát nhạc cho bé yêu + Gấu bông Long Châu',
      moTa: 'Áp dụng cho mẹ & bé khi mua men vi sinh và vitamin tổng hợp',
      mocChiTieu: 'Hóa đơn từ 650.000đ',
      dao: 'Đảo 4',
      ghiChu: 'Quà tặng dành riêng cho bé',
      islandNumber: 4
    },
    {
      id: 'd5-4b',
      maSanPham: '00062842',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00062842',
      tenSanPham: 'KEM HĂM TÃ BEPANTHEN BALM TUÝP 30G',
      quaTang: 'Tặng Bình tập uống nước BPA Free Lock&Lock cho bé',
      moTa: 'Bảo vệ làn da non nớt của trẻ nhỏ, mua combo 2 tuýp nhận quà ngay',
      mocChiTieu: 'Hóa đơn từ 200.000đ',
      dao: 'Đảo 4',
      ghiChu: 'Sản phẩm cho bé',
      islandNumber: 4
    },
    // Đảo 5
    {
      id: 'd5-5a',
      maSanPham: '00071928',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00071928',
      tenSanPham: 'VIÊN UỐNG DẦU CÁ OMEGA 3 KIRKLAND SIGNATURE 400 VIÊN',
      quaTang: 'Tặng Máy đo nồng độ oxy trong máu SpO2 Contec',
      moTa: 'Tặng quà sức khỏe khi tích lũy mua thực phẩm chức năng bổ não, tim mạch',
      mocChiTieu: 'Hóa đơn từ 800.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Hỗ trợ tim mạch & mắt',
      islandNumber: 5
    },
    {
      id: 'd5-5b',
      maSanPham: '00071933',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00071933',
      tenSanPham: 'VIÊN UỐNG BỔ NÃO GINKGO BILOBA 120MG TRUNATURE 300 VIÊN',
      quaTang: 'Tặng Hộp hạt óc chó dinh dưỡng Mỹ 250g nguyên vị',
      moTa: 'Cải thiện tuần hoàn não và trí nhớ, áp dụng khi mua thực phẩm bổ não',
      mocChiTieu: 'Hóa đơn từ 450.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Nhập khẩu chính hãng từ Mỹ',
      islandNumber: 5
    },
    {
      id: 'd5-5c',
      maSanPham: '00071940',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00071940',
      tenSanPham: 'VIÊN UỐNG BỔ XƯƠNG KHỚP GLUCOSAMINE SCHIFF PLUS 1500MG',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày FPT Long Châu',
      moTa: 'Hỗ trợ tái tạo sụn khớp, tặng kèm hộp chia thuốc thông minh giúp theo dõi cữ uống mỗi ngày',
      mocChiTieu: 'Hóa đơn từ 380.000đ',
      dao: 'Đảo 5',
      ghiChu: 'Tặng hộp chia thuốc theo dõi liều dùng mỗi ngày',
      islandNumber: 5
    },
    // Đảo 6
    {
      id: 'd5-6a',
      maSanPham: '00083912',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00083912',
      tenSanPham: 'XỊT LẠNH GIẢM ĐAU STARBALM COLD SPRAY 150ML',
      quaTang: 'Tặng Túi tập Gym thể thao chống nước thời trang',
      moTa: 'Dành cho khách hàng yêu thể thao và rèn luyện thể chất',
      mocChiTieu: 'Hóa đơn từ 300.000đ',
      dao: 'Đảo 6',
      ghiChu: 'Sản phẩm thể thao cao cấp',
      islandNumber: 6
    },
    {
      id: 'd5-6b',
      maSanPham: '00083918',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00083918',
      tenSanPham: 'CAO XOA BÓP GIẢM ĐAU BENGAY ULTRA STRENGTH TUÝP 113G',
      quaTang: 'Tặng Bộ băng bảo vệ khớp gối & cổ tay thể thao Aolikes',
      moTa: 'Giảm đau cơ khớp nhanh chóng khi vận động mạnh',
      mocChiTieu: 'Hóa đơn từ 260.000đ',
      dao: 'Đảo 6',
      ghiChu: 'Bảo vệ thể thao chuyên nghiệp',
      islandNumber: 6
    },
    // Đảo 7
    {
      id: 'd5-7a',
      maSanPham: '00094821',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00094821',
      tenSanPham: 'SI RÔ THIÊN MÔN BỔ PHỔI BÌNH ĐÔNG CHAI 280ML',
      quaTang: 'Tặng Hộp trà sâm dây Ngọc Linh thảo mộc thượng hạng',
      moTa: 'Mua các sản phẩm đông y thiên nhiên bồi bổ khí huyết',
      mocChiTieu: 'Hóa đơn từ 250.000đ',
      dao: 'Đảo 7',
      ghiChu: 'Chiết xuất tự nhiên',
      islandNumber: 7
    },
    {
      id: 'd5-7b',
      maSanPham: '00094827',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00094827',
      tenSanPham: 'CAO HỒNG SÂM HÀN QUỐC 6 NĂM TUỔI KGC HỘP 240G',
      quaTang: 'Tặng Bộ 6 ly sứ cao cấp Minh Long + Hộp táo đỏ Tân Cương',
      moTa: 'Bồi bổ sức khỏe toàn diện cho người lớn tuổi',
      mocChiTieu: 'Hóa đơn từ 1.200.000đ',
      dao: 'Đảo 7',
      ghiChu: 'Hồng sâm chính phủ Cheong Kwan Jang',
      islandNumber: 7
    },
    // Đảo 8
    {
      id: 'd5-8a',
      maSanPham: '00102938',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00102938',
      tenSanPham: 'KHẨU TRANG Y TẾ 4D KF94 LONG CHÂU HỘP 30 CÁI',
      quaTang: 'Tặng Hộp đựng khẩu trang kháng khuẩn bỏ túi + Gel rửa tay',
      moTa: 'Bảo vệ sức khỏe cho cả gia đình mỗi ngày',
      mocChiTieu: 'Hóa đơn từ 150.000đ',
      dao: 'Đảo 8',
      ghiChu: 'Tiêu chuẩn Bộ Y Tế',
      islandNumber: 8
    },
    {
      id: 'd5-8b',
      maSanPham: '00102945',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00102945',
      tenSanPham: 'NƯỚC SÚC MIỆNG KHÁNG KHUẨN BETADINE GARGLE 125ML',
      quaTang: 'Tặng Chai xịt họng thảo dược keo ong Propolis kháng khuẩn',
      moTa: 'Kháng khuẩn khoang miệng và phòng ngừa viêm họng',
      mocChiTieu: 'Hóa đơn từ 180.000đ',
      dao: 'Đảo 8',
      ghiChu: 'Thương hiệu sát khuẩn chuẩn y tế',
      islandNumber: 8
    },
    // Đảo 9
    {
      id: 'd5-9a',
      maSanPham: '00114920',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00114920',
      tenSanPham: 'MÁY ĐO HUYẾT ÁP BẮP TAY TỰ ĐỘNG OMRON HEM-7120',
      quaTang: 'Tặng Máy massage cổ vai gáy 4D giảm đau nhức',
      moTa: 'Món quà tri ân ý nghĩa cho ông bà, cha mẹ',
      mocChiTieu: 'Hóa đơn từ 1.100.000đ',
      dao: 'Đảo 9',
      ghiChu: 'Bảo hành chính hãng 5 năm',
      islandNumber: 9
    },
    {
      id: 'd5-9b',
      maSanPham: '00114926',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00114926',
      tenSanPham: 'NHIỆT KẾ ĐIỆN TỬ ĐO TRÁN HỒNG NGOẠI MICROLIFE FR1MF1',
      quaTang: 'Tặng Hộp bông gạc y tế tiệt trùng + Túi chườm hạ sốt',
      moTa: 'Đo nhiệt độ chính xác trong 1 giây không cần chạm',
      mocChiTieu: 'Hóa đơn từ 650.000đ',
      dao: 'Đảo 9',
      ghiChu: 'Thương hiệu Microlife Thụy Sĩ',
      islandNumber: 9
    },
    // Đảo 10
    {
      id: 'd5-10a',
      maSanPham: '00125819',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00125819',
      tenSanPham: 'HỘP SƠ CỨU Y TẾ GIA ĐÌNH FIRST AID KIT LONG CHÂU',
      quaTang: 'Tặng 1 Bộ bấm móng y tế thép không gỉ 7 chi tiết',
      moTa: 'Trang bị tủ thuốc tiện lợi cho mọi gia đình',
      mocChiTieu: 'Hóa đơn từ 200.000đ',
      dao: 'Đảo 10',
      ghiChu: 'Đầy đủ dụng cụ y tế thiết yếu',
      islandNumber: 10
    },
    {
      id: 'd5-10b',
      maSanPham: '00125825',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00125825',
      tenSanPham: 'BĂNG KEO CÁ NHÂN CHỐNG NƯỚC URGO WATERPROOF HỘP 20 MIẾNG',
      quaTang: 'Tặng Túi gel chườm nóng lạnh đa năng Long Châu',
      moTa: 'Bảo vệ vết thương nhỏ không thấm nước khi sinh hoạt',
      mocChiTieu: 'Hóa đơn từ 120.000đ',
      dao: 'Đảo 10',
      ghiChu: 'Thương hiệu Urgo Pháp',
      islandNumber: 10
    },
    {
      id: 'd5-10c',
      maSanPham: '00125830',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00125830',
      tenSanPham: 'HỘP CHIA THUỐC ĐA NĂNG LONG CHÂU 7 NGÀY (4 BUỔI SÁNG - TRƯA - CHIỀU - TỐI)',
      quaTang: 'Tặng 1 Hộp chia thuốc thông minh 7 ngày kháng khuẩn FPT Long Châu',
      moTa: 'Thiết kế nắp kín chống ẩm cao cấp, chia liều tiện lợi cho người lớn tuổi và bệnh mạn tính',
      mocChiTieu: 'Hóa đơn từ 150.000đ hoặc mua kèm đơn thuốc',
      dao: 'Đảo 10',
      ghiChu: 'Quà tặng tiện ích tủ thuốc gia đình',
      islandNumber: 10
    },
    // Đảo 11
    {
      id: 'd5-11a',
      maSanPham: '00136928',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00136928',
      tenSanPham: 'COMBO CHĂM SÓC TOÀN DIỆN MÙA HÈ FPT LONG CHÂU',
      quaTang: 'Tặng Vali du lịch size 20 inch Long Châu phiên bản giới hạn',
      moTa: 'Tặng ngay vali du lịch cao cấp cho đơn hàng thanh toán combo',
      mocChiTieu: 'Hóa đơn từ 1.800.000đ',
      dao: 'Đảo 11',
      ghiChu: 'Vali độc quyền Long Châu',
      islandNumber: 11
    },
    {
      id: 'd5-11b',
      maSanPham: '00136935',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00136935',
      tenSanPham: 'BỘ CHĂM SÓC SỨC KHỎE NGƯỜI CAO TUỔI LONG CHÂU CARE+',
      quaTang: 'Tặng Máy lọc không khí mini ion âm để bàn khử khuẩn',
      moTa: 'Bộ quà tặng sức khỏe hiếu nghĩa dành tặng cha mẹ',
      mocChiTieu: 'Hóa đơn từ 2.200.000đ',
      dao: 'Đảo 11',
      ghiChu: 'Chăm sóc người cao tuổi',
      islandNumber: 11
    },
    // Đảo 12
    {
      id: 'd5-12a',
      maSanPham: '00147819',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00147819',
      tenSanPham: 'VÉ DỰ THƯỞNG SIÊU CHUNG CUỘC TOÀN HÀNH TRÌNH ĐỢT 5',
      quaTang: 'Giải thưởng Kim Cương: 1 Lượng Vàng SJC 9999 + Xe Máy Vespa Sprint',
      moTa: 'Vinh danh khách hàng đồng hành suốt 5 đợt khuyến mãi. Nhận mã quay số may mắn',
      mocChiTieu: 'Hóa đơn từ 1.000.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Đêm hội Gala trao thưởng trực tiếp tại TP.HCM',
      islandNumber: 12
    },
    {
      id: 'd5-12b',
      maSanPham: '00147825',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00147825',
      tenSanPham: 'GIẢI VÀNG CÔNG NGHỆ VỀ ĐÍCH ĐỢT 5',
      quaTang: 'Tặng Điện thoại iPhone 16 Pro Max 256GB Titan Tự Nhiên',
      moTa: 'Mỗi đơn hàng từ 500.000đ được tặng 1 mã quay thưởng trúng iPhone 16 Pro Max',
      mocChiTieu: 'Hóa đơn từ 500.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Quay số trực tuyến hàng tuần',
      islandNumber: 12
    },
    {
      id: 'd5-12c',
      maSanPham: '00147830',
      linkUrl: 'https://nhathuoclongchau.com.vn/tim-kiem?s=00147830',
      tenSanPham: 'GIẢI TRI ÂN MAY MẮN TOÀN HỆ THỐNG ĐỢT 5',
      quaTang: '100 Nồi cơm điện tử Tefal thông minh đa năng',
      moTa: 'Dành cho khách hàng may mắn chặng Về Đích trên toàn bộ 2.000+ nhà thuốc',
      mocChiTieu: 'Hóa đơn từ 300.000đ',
      dao: 'Đảo 12',
      ghiChu: 'Quà tặng trao tận tay tại nhà thuốc',
      islandNumber: 12
    }
  ]
};

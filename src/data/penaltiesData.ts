import { PenaltyRuleItem } from '../types';

export const DEFAULT_PENALTY_DATA: PenaltyRuleItem[] = [
  {
    id: 'ID23',
    columnA: 'Quy trình_ Bán hàng tại shop',
    columnB: 'Trả hàng xuất lại',
    columnC: 'Mã: ID23',
    keyword: '- Tự ý thực hiện trả hàng khi Khách hàng không có nhu cầu và thực hiện xuất lại với CTKM mà khách hàng không được hưởng',
    description: '📌 Yêu cầu: - Thực hiện đổi trả hàng hóa đúng nhu cầu thực tế\n- Mọi thông tin trên chứng từ đổi trả phải khớp với thực tế.\n- Thao tác đổi trả trên hệ thống và in chứng từ đổi trả giao cho Khách hàng ngay sau khi thực hiện đổi trả\n- Trả hàng xuất lại chỉ áp dụng trong trường hợp nhân viên có sơ suất trong quá trình xuất hàng và phải xuất lại theo đúng thực tế (Sai thông tin khách hàng, sai thông tin sản phẩm, Chọn sai CTKM mà khách hàng lựa chọn,...)\n\n⚠️ Hành vi vi phạm: - Tự ý thực hiện trả hàng khi Khách hàng không có nhu cầu và thực hiện xuất lại với CTKM mà khách hàng không được hưởng',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: 'Giá trị vi phạm < 2,000,000 VND:\n- Lần 1: Không nhận 30% INC\n- Lần 2: Không nhận 100% INC + Không nâng lương trong vòng một năm tính từ thời điểm vi phạm.\n- Lần 3: Sa thải\nGiá trị vi phạm từ 2,000,000 VND - 10,000,000VND:\n- Lần 1: Phạt gấp đôi số tiền vi phạm\n- Lần 2: Sa thải\nGiá trị vi phạm > 10,000,000 VND:\n- Lần 1: Sa thải',
    probationEmployeePenalty: 'Giá trị vi phạm < 2,000,000 VND:\n- Lần 1: Không nhận 30% INC\n- Lần 2: Không nhận 100% INC + Không nâng lương trong vòng một năm tính từ thời điểm vi phạm.\n- Lần 3: Sa thải\nGiá trị vi phạm từ 2,000,000 VND - 10,000,000VND:\n- Lần 1: Phạt gấp đôi số tiền vi phạm\n- Lần 2: Sa thải\nGiá trị vi phạm > 10,000,000 VND:\n- Lần 1: Sa thải'
  },
  {
    id: 'ID26',
    columnA: 'Quy trình_ Bán hàng tại shop',
    columnB: 'Giao hàng',
    columnC: 'Mã: ID26',
    keyword: 'Nhân viên Shop sai hàng, sai hàm lượng; sai số lượng thuốc/ sản phẩm khách yêu cầu',
    description: '📌 Yêu cầu: Giao đúng với loại thuốc, tên thuốc, số lượng thuốc/ sản phẩm mà khách yêu cầu, đúng với thông tin trên hóa đơn\n\n⚠️ Hành vi vi phạm: Nhân viên Shop sai hàng, sai hàm lượng; sai số lượng thuốc/ sản phẩm khách yêu cầu',
    columnF: 'NV Nhà thuốc',
    officialEmployeePenalty: 'Nhân viên vi phạm phải giao tận nơi cho Khách hàng số lượng thuốc thiếu.\nTruy thu 20% giá trị sản phẩm giao thiếu số lượng và số tiền truy thu sẽ được gửi lại vào tài khoản của Khách hàng',
    probationEmployeePenalty: 'Nhân viên vi phạm phải giao tận nơi cho Khách hàng số lượng thuốc thiếu, và:\n- Lần 1: Nhắc nhở\n- Lần 2: Truy thu 20% giá trị sản phẩm giao thiếu số lượng và số tiền truy thu sẽ được gửi lại vào tài khoản của Khách hàng'
  },
  {
    id: 'ID28',
    columnA: 'Quy trình_ Bán hàng tại shop',
    columnB: 'CTKM',
    columnC: 'Mã: ID28',
    keyword: 'Bán sai CTKM, không giao VPKM cho khách',
    description: '📌 Yêu cầu: Áp dụng đúng CTKM cho khách hàng, giao đầy đủ VPKM cho khách hàng (nếu có)\n\n⚠️ Hành vi vi phạm: Bán sai CTKM, không giao VPKM cho khách',
    columnF: 'NV Bán hàng',
    officialEmployeePenalty: 'Bồi thường thiệt hại, và:\n- Lần 1: Nhắc nhở\n- Lần 2: 50,000VND\n- Từ lần 3: 100,000VND/lần',
    probationEmployeePenalty: 'Bồi thường thiệt hại, và:\n- Lần 1: Nhắc nhở\n- Từ lần 2: 50,000VND/lần'
  },
  {
    id: 'ID34',
    columnA: 'Quy trình_ Bán hàng tại shop',
    columnB: 'Giao BNTT',
    columnC: 'Mã: ID34',
    keyword: '- Không đưa biên nhận thanh toán cho khách hàng ngay khi hoàn tất giao dịch\n+ Trường hợp đã hoàn tất SO nhưng không in được biên nhận thanh toán (Do lỗi hệ thống, lỗi máy in): Gửi mã tra cứu hóa đơn điện tử/ link tra cứu hóa đơn điện tử qua SĐT cho Khách hàng ngay tại thời điểm giao dịch\n+ Trường hợp không hoàn tất được đơn hàng để in biên nhận thanh toán (do mất mạng , mất điện , lỗi hệ thống .. ): Gửi biên nhận thanh toán tận nơi cho khách hoặc gửi hình ảnh biên nhận thanh toán hoặc mã tra cứu hóa đơn điện tử/link tra cứu hóa đơn điện tử qua tin nhắn cho khách hàng trong vòng 24 giờ',
    description: '📌 Yêu cầu: 100% Đơn hàng sau khi hoàn tất phải gửi lại biên nhận thanh toán cho Khách hàng\n\n⚠️ Hành vi vi phạm: Không đưa biên nhận thanh toán cho khách hàng ngay khi hoàn tất giao dịch',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: '100% giá trị BNTT',
    probationEmployeePenalty: '- Lần 1: Nhắc nhở\n- Lần 2: 100% giá trị BNTT'
  },
  {
    id: 'ID39',
    columnA: 'Quy trình _Bán hàng online',
    columnB: 'Giao hàng tại nhà',
    columnC: 'Mã: ID39',
    keyword: 'Giao không đúng, không đầy đủ theo phiếu giao dịch. (Trừ trường hợp giao nhầm hàm lượng thuốc và nhầm thuốc theo khung riêng)\nKhông xuất Vật phẩm khuyến mại cho KH',
    description: '📌 Yêu cầu: Bàn giao hàng cho KH theo đúng thông tin trên phiếu giao dịch (bao gồm cả VPKM).\n\n⚠️ Hành vi vi phạm: Giao không đúng, không đầy đủ theo phiếu giao dịch. Không xuất Vật phẩm khuyến mại cho KH',
    columnF: 'NV Nhà thuốc/ SM nhà thuốc',
    officialEmployeePenalty: 'Bồi thường thiệt hại phát sinh (nếu có), và:\n+ Lần 1: Nhắc nhở\n+ Lần 2: Không nhận 20% INC tháng gần nhất\n+ Lần 3: Hạ bậc chức danh/ Xem xét không lên quản lý chính thức/ không ký hợp đồng chính thức',
    probationEmployeePenalty: 'Bồi thường thiệt hại phát sinh (nếu có), và:\n+ Lần 1: Nhắc nhở\n+ Từ lần 2: 50,000VND/lần'
  },
  {
    id: 'ID54',
    columnA: 'Quy trình_Luân chuyển nội bộ',
    columnB: 'Trễ hạn luân chuyển',
    columnC: 'Mã: ID54',
    keyword: 'Trễ hạn LCNB theo quy định',
    description: '📌 Yêu cầu: - Thời gian LCNB từ Nhà thuốc đến Nhà thuốc:\n+ Không qua Kho tổng: 3 ngày.\n+ Có gửi hàng qua Kho tổng: 7 ngày.\n- Thời gian LCNB từ Nhà thuốc về Kho tổng: 7 ngày.\n- Thời gian LCNB từ Kho tổng đến Nhà thuốc: 7 ngày. Khung tính thời hạn LCNB: từ ngày xuất đến ngày nhập. Trong trường hợp những lệnh LCNB vẫn chưa hoàn tất (đang ở tình trạng “Đã xuất”) thì tính từ ngày xuất đến ngày chốt báo cáo.\nThời gian hoàn tất tính là ngày làm việc (trừ ngày lễ và chủ nhật).\n\n⚠️ Hành vi vi phạm: Trễ hạn LCNB theo quy định',
    columnF: 'Kho tổng/Nhà thuốc LCNB trễ hạn',
    officialEmployeePenalty: '- Nhà thuốc hoạt động > 30 ngày: 50,000 VND/ lệnh/ ngày, tối đa 500,000 VND/lệnh\n- Nhà thuốc hoạt đồng ≤ 30 ngày: Bắt đầu tính trễ hạn đối với lệnh LCNB từ D+30 ngày (với D là ngày mở bán/ngày phát sinh doanh số trên hệ thống)',
    probationEmployeePenalty: '- Nhà thuốc hoạt động > 30 ngày: 50,000 VND/ lệnh/ ngày, tối đa 500,000 VND/lệnh\n- Nhà thuốc hoạt đồng ≤ 30 ngày: Bắt đầu tính trễ hạn đối với lệnh LCNB từ D+30 ngày (với D là ngày mở bán/ngày phát sinh doanh số trên hệ thống)'
  },
  {
    id: 'ID55',
    columnA: 'Quy định_Đổi trả',
    columnB: 'Khách hàng đổi trả',
    columnC: 'Mã: ID55',
    keyword: '- Đổi trả hàng không thực hiện đúng và đủ như quy định.\n- Khách hàng không có nhu cầu đổi/ trả hàng nhưng nhân viên thực hiện đổi/ trả trên hệ thống.',
    description: '📌 Yêu cầu: - Đổi trả hàng đúng với chính sách đổi trả\n- Nhân viên không được tự ý đổi trả hàng khi Khách hàng không có nhu cầu\n\n⚠️ Hành vi vi phạm: - Đổi trả hàng không thực hiện đúng và đủ như quy định.\n- Khách hàng không có nhu cầu đổi/ trả hàng nhưng nhân viên thực hiện đổi/ trả trên hệ thống.',
    columnF: 'NV Nhà thuốc/ SM nhà thuốc',
    officialEmployeePenalty: 'Giá trị vi phạm < 2,000,000 VND:\n- Lần 1: Không nhận 30% INC\n- Lần 2: Không nhận 100% INC + Không nâng lương trong vòng một năm tính từ thời điểm vi phạm.\n- Lần 3: Sa thải\nGiá trị vi phạm từ 2,000,000 VND - 10,000,000VND:\n- Lần 1: Phạt gấp đôi số tiền vi phạm\n- Lần 2: Sa thải\nGiá trị vi phạm > 10,000,000 VND:\n- Lần 1: Sa thải',
    probationEmployeePenalty: 'Giá trị vi phạm < 2,000,000 VND:\n- Lần 1: Không nhận 30% INC\n- Lần 2: Không nhận 100% INC + Không nâng lương trong vòng một năm tính từ thời điểm vi phạm.\n- Lần 3: Sa thải\nGiá trị vi phạm từ 2,000,000 VND - 10,000,000VND:\n- Lần 1: Phạt gấp đôi số tiền vi phạm\n- Lần 2: Sa thải\nGiá trị vi phạm > 10,000,000 VND:\n- Lần 1: Sa thải'
  },
  {
    id: 'ID57',
    columnA: 'Quy trình_Giải quyết KNKH',
    columnB: 'Lỗi thái độ',
    columnC: 'Mã: ID57',
    keyword: 'Có thái độ làm khách hàng phàn nàn, không hài lòng về cách ứng xử, hành xử:\n- Không nhiệt tình, niềm nở\n- Từ chối hỗ trợ khách hàng, đùn đẩy hỗ trợ\n- NV tranh cãi, thái độ với đồng nghiệp trước KH.\n- NV tụ tập, ăn vặt, sử dụng ĐT làm việc riêng khi đang tiếp KH\n- Nói chuyện, giao tiếp trống không, lên giọng, nói lớn,... với khách hàng\n- Có thái độ khi giao tiếp với khách (Trợn mắt, nhướn mày, xua tay,...)',
    description: '📌 Yêu cầu: Luôn tôn trọng và làm hài lòng khách hàng\n\n⚠️ Hành vi vi phạm: Có thái độ làm khách hàng phàn nàn, không hài lòng về cách ứng xử, hành xử:\n- Không nhiệt tình, niềm nở\n- Từ chối hỗ trợ khách hàng, đùn đẩy hỗ trợ\n- NV tranh cãi, thái độ với đồng nghiệp trước KH.\n- NV tụ tập, ăn vặt, sử dụng ĐT làm việc riêng khi đang tiếp KH\n- Nói chuyện, giao tiếp trống không, lên giọng, nói lớn,... với khách hàng\n- Có thái độ khi giao tiếp với khách (Trợn mắt, nhướn mày, xua tay,...)',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: '- Lần 1: 500,000 VND/lần\n- Lần 2: 500,000 VND/lần\n- Lần 3: Sa thải',
    probationEmployeePenalty: '- Lần 1: Nhắc nhở\n- Lần 2: Không ký hợp đồng chính thức'
  },
  {
    id: 'ID71',
    columnA: 'Quy trình_Giải quyết KNKH',
    columnB: 'Lỗi nghiệp vụ',
    columnC: 'Mã: ID71',
    keyword: 'Giao sai/ thiếu hàng làm khách hàng phàn nàn, không hài lòng',
    description: '📌 Yêu cầu: Giao đúng/ đủ hàng, đồng kiểm với khách\n\n⚠️ Hành vi vi phạm: Giao sai/ thiếu hàng làm khách hàng phàn nàn, không hài lòng',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: '- Lần 1,2: Phạt 20% giá trị SP trên bill, tối thiểu 50,000 (làm tròn đến hàng chục nghìn, VD: 50k, 60k, 70k)\n- Từ lần 3: Phạt 50% INC',
    probationEmployeePenalty: '- Lần 1: Nhắc nhở\n- Từ lần 2: Phạt 20% giá trị SP trên bill, tối thiểu 50,000 (làm tròn đến hàng chục nghìn, VD: 50k, 60k,70k)'
  },
  {
    id: 'ID75',
    columnA: 'Quy trình_Giải quyết KNKH',
    columnB: 'Lỗi nghiệp vụ',
    columnC: 'Mã: ID75',
    keyword: 'Giao nhầm thuốc các loại thuốc làm khách hàng phàn nàn, không hài lòng',
    description: '📌 Yêu cầu: Giao đúng thuốc khách hàng yêu cầu\n\n⚠️ Hành vi vi phạm: Giao nhầm thuốc các loại thuốc làm khách hàng phàn nàn, không hài lòng',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: 'Bồi thường thiệt hại phát sinh, và:\n- Lần 1: Không nhận thưởng tháng vi phạm - không vượt quá 1,000,000 VND\n- Lần 2: Không nhận thưởng tháng vi phạm - không vượt quá 10,000,000 VND\n- Lần 3: Xử lý kỷ luật với hình thức cao nhất',
    probationEmployeePenalty: 'Bồi thường thiệt hại phát sinh, và:\n- Lần 1: Không nhận thưởng tháng vi phạm - không vượt quá 1,000,000 VND\n- Lần 2: Không nhận thưởng tháng vi phạm - không vượt quá 10,000,000 VND\n- Lần 3: Xử lý kỷ luật với hình thức cao nhất'
  },
  {
    id: 'ID76',
    columnA: 'Quy trình_Giải quyết KNKH',
    columnB: 'Lỗi nghiệp vụ',
    columnC: 'Mã: ID76',
    keyword: 'Giao hàng trễ làm khách hàng phàn nàn, không hài lòng',
    description: '📌 Yêu cầu: Giao hàng đúng thời gian dự kiến cho khách\n\n⚠️ Hành vi vi phạm: Giao hàng trễ làm khách hàng phàn nàn, không hài lòng',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: 'Phạt: 100,000 VND/lần',
    probationEmployeePenalty: '- Lần 1: Nhắc nhở\n- Từ lần 2: 100,000 VND/lần'
  },
  {
    id: 'ID94',
    columnA: 'Quy định_Giao hàng tại nhà',
    columnB: 'Giao hàng tại nhà',
    columnC: 'Mã: ID94',
    keyword: 'Các đơn hàng chưa giao đến nhà khách hàng, nhân viên giao hàng hoàn tất giao ngay tại Shop',
    description: '📌 Yêu cầu: Các đơn hàng chưa giao đến nhà khách hàng, nhân viên giao hàng không được hoàn tất giao ngay tại Shop\n\n⚠️ Hành vi vi phạm: Các đơn hàng chưa giao đến nhà khách hàng, nhân viên giao hàng hoàn tất giao ngay tại Shop',
    columnF: 'Người chịu trách nhiệm',
    officialEmployeePenalty: 'Phạt 50,000 VND/Đơn vi phạm',
    probationEmployeePenalty: 'Phạt 50,000 VND/Đơn vi phạm'
  },
  {
    id: 'ID95',
    columnA: 'Quy trình _Bán hàng',
    columnB: 'Bán hàng không xuất hóa đơn',
    columnC: 'Mã: ID95',
    keyword: 'Bán hàng không xuất hóa đơn nhưng có thu tiền. Tiền thừa không nộp tiền về công ty.',
    description: '📌 Yêu cầu: - Hoàn tất thu tiền tại thời điểm xuất hóa đơn.\n- Tiền thừa được nộp về công ty theo đúng quy định.\n\n⚠️ Hành vi vi phạm: Bán hàng không xuất hóa đơn nhưng có thu tiền. Tiền thừa không nộp tiền về công ty.',
    columnF: 'NV nhà thuốc/ SM nhà thuốc.',
    officialEmployeePenalty: '- Lần 1:\n+ Nếu số tiền vi phạm ≥ 10,000,000 VND, hoặc thực hiện từ 2 giao dịch trở lên: Sa thải\n+ Nếu vi phạm số tiền < 10,000,000 VND và chỉ thực hiện 1 lần: Không nhận 100% INC + không xét tăng lương 1 năm + hạ bậc (Áp dụng đối với trưởng ca và quản lý)\n- Lần 2: Sa Thải',
    probationEmployeePenalty: '- Lần 1:\n+ Nếu số tiền vi phạm ≥ 10,000,000 VND, hoặc thực hiện từ 2 giao dịch trở lên: Sa thải\n+ Nếu vi phạm số tiền < 10,000,000 VND và chỉ thực hiện 1 lần: Không nhận 100% INC + không xét tăng lương 1 năm + hạ bậc (Áp dụng đối với trưởng ca và quản lý)\n- Lần 2: Sa Thải'
  },
  {
    id: 'ID100',
    columnA: 'Quy định chụp toa thuốc',
    columnB: 'Tính tuân thủ',
    columnC: 'Mã: ID100',
    keyword: '- Nhân viên không chụp lại toa thuốc của khách hàng hoặc không thực hiện upload toa lên hệ thống\n- Toa thuốc không đầy đủ thông tin hợp lệ',
    description: '📌 Yêu cầu: - Nhân viên phải chụp lại toa thuốc và upload hình ảnh lên hệ thống đối với tất cả đơn hàng khách hàng mang toa đến nhà thuốc\n- Nhân viên ecom phải up đầy đủ toa thuốc khách hàng cung cấp lên hệ thống khi thực hiện tạo đơn hàng online\n- Đơn thuốc phải đảm bảo chụp đầy đủ thông tin: thông tin cơ sở khám bệnh, chữa bệnh, họ và tên của người kê đơn thuốc, thông tin người bệnh, tên thuốc hàm lượng thuốc, liều dùng.\n\n⚠️ Hành vi vi phạm: - Nhân viên không chụp lại toa thuốc của khách hàng hoặc không thực hiện upload toa lên hệ thống\n- Toa thuốc không đầy đủ thông tin hợp lệ',
    columnF: 'Cá nhân vi phạm',
    officialEmployeePenalty: '- Lần 1: Phạt 50,000 VND\n- Từ lần 2: Phạt 200,000 VND/lần vi phạm',
    probationEmployeePenalty: '- Lần 1: Phạt 50,000 VND\n- Từ lần 2: Phạt 200,000 VND/lần vi phạm'
  }
];

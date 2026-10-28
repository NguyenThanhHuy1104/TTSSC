import { Guide } from '../types';
import { generateStepMockup } from '../utils/imageMockups';
import step1Svg from '../assets/step1_ar_frt.svg';
import step2Svg from '../assets/step2_ar_frt.svg';
import step3Svg from '../assets/step3_ar_frt.svg';
import step4Svg from '../assets/step4_ar_frt.svg';
import step5Svg from '../assets/step5_ar_frt.svg';
import insidePassStep1Svg from '../assets/step1_inside_pass.svg';
import insidePassStep2Svg from '../assets/step2_inside_pass.svg';
import insidePassStep3Svg from '../assets/step3_inside_pass.svg';
import insidePassStep4Svg from '../assets/step4_inside_pass.svg';

export const GUIDES: Guide[] = [
  {
    id: 'huong-dan-doi-mat-khau-inside',
    slug: 'huong-dan-doi-mat-khau-inside',
    title: 'Hướng dẫn thao tác đổi mật khẩu Inside',
    description: 'Chủ động đổi mật khẩu Inside khi bị khóa do hết hạn (RSA), báo sai mật khẩu hoặc quên mật khẩu đăng nhập.',
    category: 'Tài khoản',
    categoryId: 'tai-khoan',
    thumbnail: insidePassStep1Svg,
    featured: true,
    isNew: true,
    updatedAt: '2026-08-11',
    readingTime: 2,
    author: 'Trung tâm SSC - 87333',
    keywords: ['đổi mật khẩu', 'inside', 'quên mật khẩu', 'long châu', 'rsa', 'fptchat', 'identity.frt.vn', '87333', 'tài khoản'],
    steps: [
      {
        id: 'inside-b1-quen-mat-khau',
        title: 'Bước 1: Bấm "Quên mật khẩu" tại màn hình đăng nhập Inside',
        content: `CÁC TRƯỜNG HỢP ANH CHỊ CHỦ ĐỘNG THAY ĐỔI MẬT KHẨU:
1. RSA thông báo User bị khóa do hết hạn mật khẩu.
2. Hệ thống báo sai mật khẩu / Quên mật khẩu.

THAO TÁC THỰC HIỆN:
- Tại màn hình đăng nhập ứng dụng mRSA, nhấn trực tiếp vào dòng chữ "Quên mật khẩu ..." phía dưới nút Đăng nhập.`,
        actionUrl: 'https://identity.frt.vn/Account/ForgetPassword',
        actionLabel: 'TRUY CẬP TRANG IDENTITY.FRT.VN ↗',
        copyableText: 'https://identity.frt.vn/Account/ForgetPassword',
        copyableLabel: 'Địa chỉ cổng xác thực Identity:',
        image: insidePassStep1Svg,
        imageCaption: 'Hình 1: Bấm "Quên mật khẩu" trên màn hình đăng nhập Inside',
        notice: {
          type: 'info',
          title: 'Đối tượng áp dụng',
          content: 'Dành cho tất cả Dược sĩ, Cửa hàng trưởng và Nhân viên thuộc hệ thống Nhà thuốc Long Châu / FPT Retail.'
        }
      },
      {
        id: 'inside-b2-dien-username',
        title: 'Bước 2: Điền thông tin Username & Bấm "Lấy lại mật khẩu"',
        content: `1. Tại màn hình "QUÊN MẬT KHẨU" (identity.frt.vn), nhập Username vào ô Tên tài khoản.
   - Quy tắc Username: Nếu Email công ty là ANNV@fpt.com thì điền Username là "ANNV".
2. Kiểm tra lại tên tài khoản đã nhập chính xác.
3. Bấm nút "Lấy lại mật khẩu".`,
        copyableText: 'ANNV',
        copyableLabel: 'Ví dụ định dạng Username (Email ANNV@fpt.com):',
        image: insidePassStep2Svg,
        imageCaption: 'Hình 2: Điền Username (VD: ANNV) và ấn Lấy lại mật khẩu',
        notice: {
          type: 'warning',
          title: 'Lưu ý kiểm tra tin nhắn FPTChat ngay',
          content: 'Sau khi ấn "Lấy lại mật khẩu", mở ngay ứng dụng FPTChat trên máy tính/điện thoại để nhận đường dẫn reset. Đường dẫn này sẽ hết hạn trong vòng 10 phút!'
        }
      },
      {
        id: 'inside-b3-nhap-mat-khau-otp',
        title: 'Bước 3: Mở tin nhắn FPTChat, nhập Mật khẩu mới, OTP & Bấm Xác nhận',
        content: `1. Mở đường dẫn reset mật khẩu được gửi qua tin nhắn FPTChat.
2. Màn hình "Đặt lại mật khẩu" (reset-pass.frt.vn) xuất hiện.
3. Điền Mật khẩu mới tuân thủ đầy đủ quy định an toàn:
   - Ít nhất 8 ký tự
   - Có chữ hoa (A-Z)
   - Có chữ thường (a-z)
   - Có chữ số (0-9)
   - Không chứa từ khóa quá ngắn hoặc thông tin trùng tên tài khoản
4. Nhập lại Mật khẩu mới vào ô "Xác nhận mật khẩu".
5. Nhập mã OTP nhận được vào ô "Mã OTP" và bấm "Xác nhận".`,
        image: insidePassStep3Svg,
        imageCaption: 'Hình 3: Nhập Mật khẩu mới đáp ứng đủ 4 tiêu chuẩn, mã OTP và bấm Xác nhận',
        notice: {
          type: 'info',
          title: 'Quy định đặt mật khẩu hợp lệ',
          content: 'Mật khẩu cần gồm cả chữ HOA, chữ thường, chữ số và độ dài tối thiểu 8 ký tự.'
        }
      },
      {
        id: 'inside-b4-thong-bao-thanh-cong',
        title: 'Bước 4: Thông báo thành công & Đăng nhập lại với Mật khẩu mới',
        content: `1. Hệ thống hiển thị biểu tượng tích xanh cùng thông báo: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới."
2. Bắt đầu quay lại ứng dụng Inside và tiến hành đăng nhập bằng Mật khẩu mới vừa tạo.`,
        image: insidePassStep4Svg,
        imageCaption: 'Hình 4: Màn hình thông báo Đặt lại mật khẩu thành công',
        notice: {
          type: 'danger',
          title: 'LƯU Ý CỰC KỲ QUAN TRỌNG',
          content: 'SAU KHI THAO TÁC Ở BƯỚC 2, ANH CHỊ KIỂM TRA NGAY TIN NHẮN Ở FPTCHAT. LINK SẼ HẾT HẠN TRONG 10 PHÚT, THAO TÁC LẠI TỪ ĐẦU.'
        }
      }
    ]
  },
  {
    id: 'dieu-chinh-hoa-don-vat',
    slug: 'dieu-chinh-hoa-don-vat',
    title: 'Hướng dẫn điều chỉnh thông tin hóa đơn VAT',
    description: 'Chỉ được điều chỉnh các mục: Tên người mua; Tên đơn vị người mua và Địa chỉ người mua - Điều chỉnh Mã số thuế: mail cho Kế toán hỗ trợ xử lý',
    category: 'Hóa đơn',
    categoryId: 'hoa-don',
    thumbnail: generateStepMockup({
      title: 'Cổng Điều chỉnh Hóa đơn - AR.FRT.VN',
      badgeText: 'Hóa đơn VAT',
      fields: [
        { label: 'Số đơn hàng', value: '81163091821715853013923', active: true },
        { label: 'Tên người mua', value: 'Trương Trọng Tuấn' }
      ],
      buttons: [
        { label: 'Tìm kiếm', primary: false },
        { label: 'Chỉnh sửa', primary: true, stepNum: 1 }
      ]
    }),
    featured: true,
    isNew: true,
    updatedAt: '2026-08-13',
    readingTime: 3,
    author: 'Trung tâm SSC - 87333',
    keywords: ['hóa đơn', 'VAT', 'điều chỉnh', 'GTGT', 'kế toán', 'ar.frt.vn', 'TBSS', 'mã số thuế'],
    videoUrl: '',
    videoDuration: '03:25',
    videoDescription: 'Video hướng dẫn đầy đủ thao tác điều chỉnh hóa đơn GTGT trên cổng AR.FRT.VN.',
    steps: [
      {
        id: 'b1-dang-nhap-tim-kiem',
        title: 'Bước 1: Truy cập trang https://ar.frt.vn/ & Tìm kiếm hóa đơn',
        content: `1. Truy cập trang web https://ar.frt.vn/ và đăng nhập tài khoản Quản Lý.
2. Chọn mục Điều chỉnh hóa đơn trên menu chức năng.
3. Nhập thông tin tìm kiếm theo một trong các trường:
   - Mã số thuế
   - Số điện thoại
   - Số đơn hàng
   - Ngày hóa đơn
4. Nhấn nút Tìm kiếm để xem danh sách các đơn hàng đã có hóa đơn.`,
        actionUrl: 'https://ar.frt.vn/',
        actionLabel: 'TRUY CẬP TRANG AR.FRT.VN ↗',
        copyableText: 'https://ar.frt.vn/',
        copyableLabel: 'Đường dẫn truy cập:',
        image: step1Svg,
        imageCaption: 'Hình 1: Đăng nhập https://ar.frt.vn/, chọn Điều chỉnh hóa đơn và Tìm kiếm đơn hàng',
        notice: {
          type: 'info',
          content: 'Yêu cầu tài khoản đăng nhập phải được phân quyền user SM/Kế toán cửa hàng.'
        }
      },
      {
        id: 'b2-b3-chon-don-hang',
        title: 'Bước 2 & 3: Chọn số đơn hàng & Nhấn nút Chỉnh sửa',
        content: `1. Bước 2: Trong danh sách đơn hàng xuất hiện bên dưới kết quả tìm kiếm, click trực tiếp vào Số đơn hàng muốn chỉnh sửa.
2. Bước 3: Tại giao diện Thông tin hóa đơn chi tiết, nhấn nút Chỉnh sửa ở góc phải màn hình để mở các ô nhập liệu.`,
        image: step2Svg,
        imageCaption: 'Hình 2: Chọn số đơn hàng và bấm nút Chỉnh sửa'
      },
      {
        id: 'b4-dieu-chinh-thong-tin-quy-dinh',
        title: 'Bước 4: Chỉnh sửa các thông tin theo quy định',
        content: `Tiến hành nhập/sửa các thông tin được yêu cầu. Dược sĩ / Kế toán lưu ý phạm vi cho phép:

MỤC ĐƯỢC PHÉP ĐIỀU CHỈNH TRỰC TIẾP:
1. Tên người mua hàng
2. Tên đơn vị người mua hàng
3. Địa chỉ người mua hàng

ĐIỀU CHỈNH MÃ SỐ THUẾ (MST):
- Không tự chỉnh sửa Mã số thuế trên giao diện này.
- Trường hợp cần sửa MST: Gửi email cho Kế toán (KT) hỗ trợ xử lý.`,
        notice: {
          type: 'warning',
          title: 'Quy định quan trọng về Mã số thuế',
          content: 'Chỉ điều chỉnh Tên người mua, Tên đơn vị và Địa chỉ. Nếu sai Mã số thuế, bắt buộc phải gửi email cho Kế toán hỗ trợ xử lý, tuyệt đối không tự ý thay đổi.'
        },
        image: step3Svg,
        imageCaption: 'Hình 3: Nhập nội dung chỉnh sửa Tên người mua, Tên đơn vị mua hàng và Địa chỉ'
      },
      {
        id: 'b5-b6-luu-nhap-hoan-tat',
        title: 'Bước 5 & 6: Lưu bản nháp & Nhấn Hoàn Tất',
        content: `1. Bước 5 (Lưu bản nháp):
   - Khi nhấn nút Lưu, hệ thống chỉ lưu bản nháp các thông tin vừa nhập, chưa tính là hoàn tất chỉnh sửa. Với bản lưu nháp thì vẫn có thể tiếp tục sửa đổi.

2. Bước 6 (Hoàn tất chỉnh sửa):
   - Kiểm tra kỹ lại toàn bộ thông tin đã điều chỉnh => Nhấn nút Hoàn Tất.
   - Hệ thống hiển thị thông báo thành công: "Hoàn tất điều chỉnh hóa đơn thành công!". Lúc này hệ thống sẽ khóa chỉnh sửa và tính là một lần hoàn tất.`,
        notice: {
          type: 'danger',
          title: 'Lưu ý giới hạn hoàn tất (Tối đa 3 lần)',
          content: 'Mỗi hóa đơn chỉ được phép bấm Hoàn tất tối đa 3 lần. Nếu cố gắng hoàn tất lần thứ 4, hệ thống sẽ báo lỗi: "Bạn đã điều chỉnh hóa đơn quá số lần cho phép".'
        },
        image: step4Svg,
        imageCaption: 'Hình 4: Nhấn nút Lưu và hiển thị thông báo Lưu điều chỉnh hoá đơn thành công!'
      },
      {
        id: 'b7-b8-xem-xuat-tbss',
        title: 'Bước 7 & 8: Bấm Xem hóa đơn & Tải Thông báo sai sót (TBSS)',
        content: `1. Bước 7: Bấm nút Xem hóa đơn ở góc dưới bên phải màn hình.
2. Bước 8 (Nhận Thông báo sai sót - TBSS):
   - Hệ thống sẽ trả kết quả Thông báo hóa đơn điện tử có sai sót (TBSS - Mẫu 04/SS-HĐĐT).
   - Mỗi thông tin điều chỉnh sẽ xuất ra một tệp TBSS PDF tương ứng.
   - Nhấn biểu tượng Tải xuống (Download) trên trình duyệt để lưu file PDF TBSS về máy.`,
        notice: {
          type: 'info',
          title: 'Lưu ý bỏ chặn Pop-ups cửa sổ bật lên',
          content: 'Nếu điều chỉnh nhiều thông tin nhưng trình duyệt chỉ hiển thị 1 file PDF, hãy cho phép Pop-ups trên trình duyệt (xem hướng dẫn "Tài Liệu Hướng dẫn bỏ block Pop-ups để xem đầy đủ thông tin TBSS điều chỉnh.pdf") để mở đủ các file TBSS còn lại.',
          actionUrl: 'https://drive.google.com/file/d/1ZcT43KjlSChoUH7QmqBSvmg0jFn6-Rjg/view?usp=sharing',
          actionLabel: 'XEM HƯỚNG DẪN BỎ BLOCK POP-UPS ↗'
        },
        image: step5Svg,
        imageCaption: 'Hình 5: Bấm nút Xem hoá đơn để mở các tab tệp PDF Thông báo sai sót (TBSS)'
      },
      {
        id: 'cac-truong-hop-dac-biet',
        title: 'Các trường hợp đặc biệt & Xử lý sự cố',
        content: `Trong quá trình thao tác, cần nắm rõ cách xử lý các tình huống ngoại lệ sau:

1. Hoàn tất quá 3 lần:
   - Thông báo: "Bạn đã điều chỉnh hóa đơn quá số lần cho phép".
   - Khắc phục: Không thể tự chỉnh sửa thêm, cần liên hệ bộ phận Kế toán/SSC để được xử lý.

2. Hủy điều chỉnh hóa đơn:
   - B1: Nhấn nút Hủy -> Màn hình xuất hiện popup "Xác nhận huỷ điều chỉnh hoá đơn?".
   - B2: Nhấn Xác nhận -> Màn hình hiển thị thông báo "Hủy điều chỉnh hóa đơn thành công!".

3. Không nhập thông tin điều chỉnh nhưng bấm Hoàn tất:
   - Thông báo lỗi: "Cần nhập thông tin ít nhất một trong các trường Tên khách hàng, Tên đơn vị, Địa chỉ".
   - Khắc phục: Phải nhập ít nhất 1 thông tin cần sửa đổi trước khi bấm Hoàn tất.`,
        notice: {
          type: 'warning',
          title: 'Hỗ trợ kỹ thuật SSC 24/7',
          content: 'Tổng đài 87333 nhánh 2 | Email: FLC.Support@fpt.com'
        }
      }
    ]
  },
  {
    id: 'quen-mat-khau-he-thong',
    slug: 'quen-mat-khau-he-thong',
    title: 'Hướng dẫn tự khôi phục mật khẩu tài khoản SSC SSO',
    description: 'Cách sử dụng trang tự phục vụ để lấy lại mật khẩu đăng nhập máy tính, email nội bộ và hệ thống ERP khi bị quên hoặc khóa tài khoản.',
    category: 'Tài khoản',
    categoryId: 'tai-khoan',
    thumbnail: generateStepMockup({
      title: 'Cổng Khôi phục Mật khẩu SSC SSO',
      badgeText: 'Xác thực 2 lớp',
      fields: [
        { label: 'Mã nhân viên (User ID)', value: 'NV-87333', active: true },
        { label: 'Số điện thoại nhận OTP', value: '098xxxx321' }
      ],
      buttons: [{ label: 'Gửi mã OTP', primary: true, stepNum: 1 }]
    }),
    featured: true,
    isNew: true,
    updatedAt: '2026-08-12',
    readingTime: 2,
    author: 'Khối An ninh Thông tin IT',
    keywords: ['quên mật khẩu', 'password', 'sso', 'mã nhân viên', 'khôi phục', 'otp'],
    steps: [
      {
        id: 'truy-cap-portals',
        title: 'Bước 1: Truy cập trang tự khôi phục mật khẩu (Self-Service Reset)',
        content: `Khi không thể đăng nhập vào máy tính hoặc phần mềm nội bộ:
Sử dụng điện thoại di động hoặc trình duyệt web khác truy cập địa chỉ portal reset tự động.`,
        actionUrl: 'https://password.frt.vn/reset',
        actionLabel: 'TRUY CẬP TRANG RESET MẬT KHẨU ↗',
        copyableText: 'https://password.frt.vn/reset',
        copyableLabel: 'URL trang reset:',
        image: generateStepMockup({
          title: 'Self-Service Password Reset Portal',
          fields: [
            { label: 'Mã số nhân viên (Mã NV)', value: 'NV-87333', active: true, stepNum: 1 },
            { label: 'Số Căn cước công dân / CMND', value: '038096xxxxxx' }
          ],
          buttons: [{ label: 'Xác nhận thông tin', primary: true, stepNum: 1 }],
          annotations: [{ stepNum: 1, text: 'Nhập mã NV và CCCD chính chủ', x: 260, y: 180 }]
        }),
        imageCaption: 'Hình 1: Giao diện nhập thông tin định danh cá nhân'
      },
      {
        id: 'xac-nhan-otp',
        title: 'Bước 2: Nhận và nhập mã xác thực OTP gửi qua tin nhắn',
        content: `Hệ thống sẽ gửi một mã OTP gồm 6 chữ số tới số điện thoại di động đã đăng ký trên hệ thống HR.
- Nhập chính xác 6 chữ số OTP vào ô xác nhận.
- Mã OTP có hiệu lực trong vòng 180 giây.`,
        notice: {
          type: 'info',
          content: 'Nếu số điện thoại của bạn đã thay đổi, vui lòng liên hệ Nhân sự (HR) để cập nhật trước khi reset mật khẩu.'
        }
      },
      {
        id: 'dat-mat-khau-moi',
        title: 'Bước 3: Thiết lập mật khẩu mới tuân thủ quy tắc bảo mật',
        content: `Mật khẩu mới phải đáp ứng các tiêu chuẩn an toàn sau:
- Độ dài tối thiểu 8 ký tự.
- Bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (@, #, $, %, !).
- Không trùng với 3 mật khẩu gần nhất.`,
        copyableText: 'Ssc@2026Security!',
        copyableLabel: 'Cấu trúc mật khẩu hợp lệ ví dụ:',
        notice: {
          type: 'success',
          title: 'Thành công',
          content: 'Mật khẩu mới sẽ đồng bộ toàn bộ tài khoản Windows, Email Outlook, Webex và ERP sau 60 giây.'
        }
      }
    ]
  },
  {
    id: 'tao-cuoc-hop-webex',
    slug: 'tao-cuoc-hop-webex',
    title: 'Hướng dẫn tạo cuộc họp Webex và đăng ký phòng họp thông minh',
    description: 'Quy trình đặt lịch họp trực tuyến qua Cisco Webex, liên kết thiết bị phòng họp và mời nhân sự tham gia.',
    category: 'Hệ thống',
    categoryId: 'he-thong',
    thumbnail: generateStepMockup({
      title: 'Lịch họp Cisco Webex & Meeting Room',
      badgeText: 'Webex Meeting',
      fields: [
        { label: 'Chủ đề cuộc họp', value: 'Họp giao ban tuần Khối SSC', active: true },
        { label: 'Phòng họp trực tiếp', value: 'Phòng Meeting Room 03 (Tầng 8)' }
      ],
      buttons: [{ label: 'Tạo cuộc họp', primary: true, stepNum: 1 }]
    }),
    featured: false,
    isNew: false,
    updatedAt: '2026-08-10',
    readingTime: 4,
    author: 'Phòng Văn phòng & IT Support',
    keywords: ['webex', 'họp', 'meeting', 'phòng họp', 'lịch họp', 'online'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoDuration: '02:45',
    videoDescription: 'Thao tác mẫu tạo meeting phòng họp kết hợp Webex Board trên Outlook.',
    steps: [
      {
        id: 'mo-ung-dung-webex',
        title: 'Bước 1: Đăng nhập Webex hoặc Outlook Add-in',
        content: `Mở ứng dụng Cisco Webex trên máy tính hoặc truy cập trình duyệt Webex portal.
Đăng nhập bằng email công ty (user@company.com.vn) và mật khẩu SSO.`,
        actionUrl: 'https://webex.com/signin',
        actionLabel: 'MỞ TRANG ĐĂNG NHẬP WEBEX ↗',
        image: generateStepMockup({
          title: 'Cisco Webex Portal',
          fields: [
            { label: 'Email công ty', value: 'nguyen.van.a@frt.vn', active: true, stepNum: 1 },
            { label: 'Trạng thái kết nối', value: 'Đã xác thực SSO' }
          ],
          buttons: [{ label: 'Lên lịch họp (Schedule)', primary: true, stepNum: 1 }],
          annotations: [{ stepNum: 1, text: 'Bấm Lên lịch họp mới', x: 260, y: 180 }]
        }),
        imageCaption: 'Hình 1: Đăng nhập Webex và chọn Lên lịch họp'
      },
      {
        id: 'dien-thong-tin-hop',
        title: 'Bước 2: Điền thông tin cuộc họp và chọn phòng',
        content: `Điền đầy đủ các thông tin:
1. Title: Tên cuộc họp rõ ràng (Ví dụ: [Kế toán] Họp rà soát hóa đơn tháng 8)
2. Date & Time: Chọn thời gian bắt đầu và kết thúc
3. Attendees: Nhập email danh sách nhân sự cần mời
4. Location / Room: Chọn danh sách phòng họp trực tiếp tại văn phòng.`,
        notice: {
          type: 'info',
          content: 'Hệ thống sẽ tự động kiểm tra trùng lịch phòng họp vật lý và hiển thị thông báo màu xanh nếu phòng còn trống.'
        }
      },
      {
        id: 'gui-loi-moi',
        title: 'Bước 3: Phát lịch họp và nhận đường dẫn tham gia',
        content: `Sau khi bấm Schedule / Lập lịch:
- Lịch họp kèm link https://company.webex.com/meet/... sẽ tự động gửi tới email người tham dự.
- Mã số cuộc họp (Meeting Number) và Mật khẩu (Passcode) sẽ hiển thị trong file mời.`,
        copyableText: 'https://company.webex.com/join/ssc-meeting-01',
        copyableLabel: 'Đường dẫn phòng họp Webex mẫu:',
        notice: {
          type: 'success',
          content: 'Cuộc họp đã được đồng bộ lên Google Calendar / Outlook và thiết bị Webex Board tại phòng họp.'
        }
      }
    ]
  },
  {
    id: 'gui-ticket-ho-tro-ky-thuat',
    slug: 'gui-ticket-ho-tro-ky-thuat',
    title: 'Hướng dẫn gửi yêu cầu hỗ trợ kỹ thuật IT & Thiết bị văn phòng',
    description: 'Quy trình tạo ticket sự cố máy tính, mạng, phần mềm, máy in và cấp mới thiết bị làm việc.',
    category: 'Hỗ trợ kỹ thuật',
    categoryId: 'ho-tro-ky-thuat',
    thumbnail: generateStepMockup({
      title: 'Hệ thống IT Service Desk (Helpdesk)',
      badgeText: 'Ticket IT',
      fields: [
        { label: 'Loại sự cố', value: 'Máy tính chập chờn / Không kết nối Wifi', active: true },
        { label: 'Mức độ ưu tiên', value: 'Cao (Ảnh hưởng công việc hằng ngày)' }
      ],
      buttons: [{ label: 'Gửi ticket ngay', primary: true, stepNum: 1 }]
    }),
    featured: false,
    isNew: true,
    updatedAt: '2026-08-11',
    readingTime: 3,
    author: 'Bộ phận IT Service Desk',
    keywords: ['ticket', 'it', 'sự cố', 'máy tính', 'máy in', 'mạng', 'helpdesk'],
    steps: [
      {
        id: 'mo-portal-helpdesk',
        title: 'Bước 1: Truy cập Portal Helpdesk SSC',
        content: `Khi gặp sự cố máy tính, phần mềm hoặc thiết bị văn phòng, nhân viên tạo yêu cầu xử lý trên cổng Service Desk.`,
        actionUrl: 'https://helpdesk.frt.vn',
        actionLabel: 'MỞ CỔNG IT HELPDESK ↗',
        copyableText: 'https://helpdesk.frt.vn',
        copyableLabel: 'Đường dẫn Portal Helpdesk:',
        image: generateStepMockup({
          title: 'IT Helpdesk Portal',
          fields: [
            { label: 'Dịch vụ yêu cầu', value: 'Hỗ trợ phần cứng / Phần mềm', active: true, stepNum: 1 },
            { label: 'Vị trí làm việc', value: 'Tầng 5 - Khối Vận hành' }
          ],
          buttons: [{ label: 'Tạo yêu cầu mới (+)', primary: true, stepNum: 1 }],
          annotations: [{ stepNum: 1, text: 'Bấm Tạo yêu cầu mới', x: 260, y: 180 }]
        }),
        imageCaption: 'Hình 1: Giao diện cổng gửi ticket hỗ trợ IT'
      },
      {
        id: 'mo-ta-su-co',
        title: 'Bước 2: Mô tả chi tiết sự cố và ảnh chụp màn hình',
        content: `Cung cấp đầy đủ thông tin để kỹ thuật viên IT xử lý nhanh nhất:
- Tiêu đề: Tóm tắt sự cố (Ví dụ: Máy in Tầng 4 bị kẹt giấy và lỗi Offline).
- Mô tả: Chi tiết mã lỗi xuất hiện trên màn hình.
- Đính kèm: Tải lên ảnh chụp màn hình báo lỗi hoặc video ngắn.
- Số máy/IP: Tên máy tính (Ví dụ: DESKTOP-SSC873).`,
        notice: {
          type: 'warning',
          content: 'Không gửi thông tin mật khẩu cá nhân hoặc dữ liệu nhạy cảm trong mô tả ticket.'
        }
      },
      {
        id: 'theo-doi-tien-do',
        title: 'Bước 3: Theo dõi tiến độ và đánh giá chất lượng',
        content: `Sau khi gửi ticket:
- Mã ticket (Ví dụ: #IT-89201) sẽ được cấp.
- Kỹ thuật viên phụ trách sẽ liên hệ hỗ trợ trực tiếp hoặc điều khiển từ xa qua UltraViewer / AnyDesk.
- Nhận email thông báo khi sự cố đã được đóng và bấm Đánh giá hài lòng.`,
        notice: {
          type: 'success',
          content: 'Thời gian cam kết phản hồi (SLA) cho sự cố mức độ Cao là trong vòng 15 phút.'
        }
      }
    ]
  },
  {
    id: 'tra-cuu-bao-cao-doanh-thu-ton-kho',
    slug: 'tra-cuu-bao-cao-doanh-thu-ton-kho',
    title: 'Hướng dẫn tra cứu báo cáo doanh thu và xuất dữ liệu tồn kho',
    description: 'Cách xem biểu đồ doanh thu theo thời gian, lọc sản phẩm bán chạy và xuất file báo cáo Excel chuẩn.',
    category: 'Báo cáo',
    categoryId: 'bao-cao',
    thumbnail: generateStepMockup({
      title: 'Báo cáo Kinh doanh & Kho vận',
      badgeText: 'BI Reporting',
      fields: [
        { label: 'Kỳ báo cáo', value: 'Tháng 08/2026', active: true },
        { label: 'Chi nhánh / Kho', value: 'Tất cả chi nhánh miền Nam' }
      ],
      buttons: [{ label: 'Xuất file Excel', primary: true, stepNum: 1 }]
    }),
    featured: true,
    isNew: false,
    updatedAt: '2026-08-09',
    readingTime: 3,
    author: 'Phòng Phân tích Dữ liệu BI',
    keywords: ['báo cáo', 'doanh thu', 'tồn kho', 'excel', 'bi', 'doanh số'],
    steps: [
      {
        id: 'mo-he-thong-bi',
        title: 'Bước 1: Đăng nhập Cổng Báo cáo Quản trị (BI Portal)',
        content: `Truy cập vào hệ thống Báo cáo Quản trị BI SSC bằng tài khoản SSO của Cấp Quản lý hoặc Nhân viên Phân tích.`,
        actionUrl: 'https://bi.frt.vn/dashboard',
        actionLabel: 'MỞ CỔNG BÁO CÁO BI ↗',
        image: generateStepMockup({
          title: 'Power BI Business Intelligence Portal',
          fields: [
            { label: 'Dashboard chọn', value: 'Báo cáo Doanh thu & Sản lượng', active: true, stepNum: 1 },
            { label: 'Khoảng thời gian', value: 'Từ 01/08/2026 đến 13/08/2026' }
          ],
          buttons: [{ label: 'Xem báo cáo', primary: true, stepNum: 1 }],
          annotations: [{ stepNum: 1, text: 'Bấm Xem báo cáo trực quan', x: 260, y: 180 }]
        }),
        imageCaption: 'Hình 1: Đăng nhập Cổng Báo cáo BI'
      },
      {
        id: 'thiet-lap-bo-loc',
        title: 'Bước 2: Thiết lập bộ lọc dữ liệu theo nhu cầu',
        content: `Sử dụng bộ lọc ở thanh trên cùng để điều chỉnh các chỉ số:
- Chi nhánh / Cửa hàng: Lọc theo miền hoặc cửa hàng cụ thể.
- Nhóm hàng hóa: Chọn ngành hàng Điện thoại, Gia dụng hoặc Phụ kiện.
- Thời gian: Theo Ngày, Tuần, Tháng hoặc Quý.`,
        notice: {
          type: 'info',
          content: 'Dữ liệu doanh thu real-time được cập nhật tự động mỗi 15 phút một lần.'
        }
      },
      {
        id: 'xuat-file-excel',
        title: 'Bước 3: Tải file dữ liệu Excel chi tiết',
        content: `1. Di chuột vào góc phải bảng số liệu.
2. Bấm biểu tượng dấu 3 chấm [...] -> chọn Export data.
3. Chọn định dạng Data with current layout (.xlsx).
4. Bấm Export để tải file về máy tính.`,
        notice: {
          type: 'success',
          content: 'File Excel đã xuất thành công với đầy đủ công thức và mã sản phẩm chi tiết.'
        }
      }
    ]
  },
  {
    id: 'quy-trinh-hoan-tien-tra-hang',
    slug: 'quy-trinh-hoan-tien-tra-hang',
    title: 'Hướng dẫn quy trình hoàn tiền và nhận trả hàng từ khách',
    description: 'Các bước thẩm định sản phẩm, tạo phiếu nhập trả hàng, duyệt hoàn tiền chuyển khoản và hủy hóa đơn.',
    category: 'Bán hàng',
    categoryId: 'ban-hang',
    thumbnail: generateStepMockup({
      title: 'Nghiệp vụ Hoàn tiền & Trả hàng POS',
      badgeText: 'Hoàn tiền POS',
      fields: [
        { label: 'Mã đơn hàng mua', value: 'ORD-2026-9921', active: true },
        { label: 'Số tiền hoàn trả', value: '2.450.000 VNĐ' }
      ],
      buttons: [{ label: 'Tạo phiếu hoàn tiền', primary: true, stepNum: 1 }]
    }),
    featured: false,
    isNew: true,
    updatedAt: '2026-08-08',
    readingTime: 4,
    author: 'Khối Dịch vụ Khách hàng & Kế toán',
    keywords: ['hoàn tiền', 'trả hàng', 'đổi trả', 'pos', 'khách hàng', 'quy trình'],
    steps: [
      {
        id: 'kiem-tra-don-hang',
        title: 'Bước 1: Tra cứu đơn hàng gốc trên phần mềm POS',
        content: `Mở ứng dụng POS Bán hàng, nhập mã đơn hàng hoặc số điện thoại khách hàng mua hàng để kiểm tra chính sách đổi trả còn hiệu lực.`,
        actionUrl: 'https://pos.frt.vn/refund',
        actionLabel: 'MỞ HỆ THỐNG POS BÁN HÀNG ↗',
        image: generateStepMockup({
          title: 'Hệ thống POS Bán hàng & Trả hàng',
          fields: [
            { label: 'Nhập số điện thoại KH / Mã đơn', value: '0912345678', active: true, stepNum: 1 },
            { label: 'Lý do đổi trả', value: 'Sản phẩm lỗi kỹ thuật trong 7 ngày' }
          ],
          buttons: [{ label: 'Tạo phiếu nhận trả', primary: true, stepNum: 1 }],
          annotations: [{ stepNum: 1, text: 'Bấm Tạo phiếu nhận trả', x: 260, y: 180 }]
        }),
        imageCaption: 'Hình 1: Nhập thông tin tra cứu đơn hàng đổi trả'
      },
      {
        id: 'tao-phieu-hoan-tien',
        title: 'Bước 2: Chọn hình thức hoàn tiền (Chuyển khoản / Tiền mặt)',
        content: `Chọn phương thức hoàn tiền tương ứng:
- Tiền mặt: Áp dụng cho số tiền < 2.000.000 VNĐ tại cửa hàng.
- Chuyển khoản: Nhập Tên ngân hàng, Số tài khoản và Tên chủ tài khoản nhận tiền.
- Tải lên ảnh chụp tình trạng sản phẩm và biên bản xác nhận trả hàng.`,
        notice: {
          type: 'danger',
          title: 'Chú ý an toàn',
          content: 'Chỉ thực hiện chuyển khoản vào tài khoản có tên trùng khớp với thông tin Khách hàng trên hóa đơn mua ban đầu.'
        }
      },
      {
        id: 'duyet-chuyen-khoan',
        title: 'Bước 3: Duyệt lệnh hoàn tiền từ Cửa hàng trưởng & Kế toán',
        content: `Sau khi tạo phiếu:
1. Cửa hàng trưởng duyệt lệnh trên ứng dụng POS Mobile.
2. Kế toán SSC xác nhận và thực hiện chi tiền tự động qua ngân hàng liên kết.
3. Khách hàng nhận được tin nhắn SMS xác nhận hoàn tiền thành công.`,
        notice: {
          type: 'success',
          content: 'Quy trình hoàn tiền hoàn tất, số tồn kho tự động cộng trả lại hệ thống kho.'
        }
      }
    ]
  }
];

# Front-end QuizFlow

Thư mục chứa giao diện quản trị viên và giáo viên của QuizFlow, dùng HTML5, CSS3 và JavaScript thuần.

## Khởi chạy

Mở [index.html](index.html) bằng trình duyệt. Chọn chức năng từ trang Tổng quan. Bấm logo QuizFlow hoặc mục Tổng quan trên sidebar giáo viên để quay về trang này. Sidebar giáo viên liên kết trực tiếp giữa bốn màn hình giáo viên.

Các trang mở trực tiếp bằng đường dẫn `file://` và dùng tài nguyên tương đối. Bật JavaScript để dùng sidebar giáo viên, bộ lọc và hộp thoại. Giao diện dùng phông chữ sẵn có trên thiết bị. Từ Tổng quan, chọn một môn để mở ngay danh sách lớp tương ứng.

| Màn hình | Tệp HTML |
| --- | --- |
| Quản lý người dùng Admin | [pages/admin/users.html](pages/admin/users.html) |
| Môn học & lớp học | [pages/teacher/subjects-classes.html](pages/teacher/subjects-classes.html) |
| Ngân hàng câu hỏi & nhập Excel | [pages/teacher/question-bank.html](pages/teacher/question-bank.html) |
| Tạo đề thi & cấu hình sinh đề | [pages/teacher/exam-builder.html](pages/teacher/exam-builder.html) |
| Thống kê & xuất bảng điểm | [pages/teacher/exam-analytics.html](pages/teacher/exam-analytics.html) |

## Cấu trúc thư mục

```text
frontend/
├── index.html              # Tổng quan
├── assets/
│   ├── css/
│   │   ├── variables.css    # Biến thiết kế
│   │   ├── base.css         # Reset, nền và kiểu chữ
│   │   ├── layout.css       # Khung ứng dụng và lưới thẻ
│   │   ├── components.css   # Thành phần giao diện dùng chung
│   │   ├── animations.css   # Biến, keyframes, tiện ích và Reduce motion
│   │   ├── responsive.css
│   │   ├── workspace.css    # Khung và giao diện dùng chung
│   │   ├── teacher-sidebar.css
│   │   ├── index.css
│   │   ├── admin-users.css
│   │   ├── subjects-classes.css
│   │   ├── question-bank.css
│   │   ├── exam-builder.css
│   │   └── exam-analytics.css
│   ├── js/
│   │   ├── motion.js        # Reveal, spotlight và tùy chọn chuyển động
│   │   ├── ui.js            # Modal, drawer, toggle, sao chép
│   │   ├── teacher-sidebar.js
│   │   ├── admin-users.js
│   │   ├── subjects-classes.js
│   │   ├── question-bank.js
│   │   ├── exam-builder.js
│   │   └── exam-analytics.js
│   ├── templates/
│   │   └── question-import-template.xlsx
│   └── img/
├── pages/
│   ├── admin/
│   │   └── users.html
│   └── teacher/
│       ├── subjects-classes.html
│       ├── question-bank.html
│       ├── exam-builder.html
│       └── exam-analytics.html
└── README.md
```

Các tệp `.gitkeep` đã có từ bước khởi tạo giúp Git lưu thư mục rỗng.

## Quy ước

- Tên tệp và thư mục dùng chữ thường không dấu, theo dạng `kebab-case`, ví dụ `question-bank.html`.
- Lưu tệp bằng UTF-8; nội dung giao diện và nhãn hiển thị dùng tiếng Việt.
- Dùng HTML5, CSS3 và JavaScript thuần.
- Ở chiều rộng từ 64rem, sidebar rộng 14,5rem và vùng nội dung tối đa 96rem. Ở màn hình nhỏ hơn, nút menu mở ngăn điều hướng. Bảng điểm và bảng tài khoản chuyển sang thẻ khi màn hình hẹp hơn 48rem.
- Tái sử dụng CSS và JavaScript trong `assets/`; không dùng inline style ngoài biến CSS động cho hiệu ứng (như `--i`, `--mx`, `--my`), không sao chép CSS giữa các trang.
- Dùng thẻ HTML ngữ nghĩa, có nhãn cho trường nhập liệu; trạng thái có cả biểu tượng và nhãn chữ.
- Dữ liệu hiện được khai báo trong HTML; xem trạng thái tích hợp bên dưới.
- Đường dẫn đến CSS, JavaScript và hình ảnh dùng đường dẫn tương đối từ từng trang HTML.

## Chức năng

- **Admin** có tìm kiếm tiếng Việt, lọc vai trò/trạng thái và xác nhận theo tài khoản. Tài khoản quản trị có thao tác bị khóa.
- **Môn và lớp** gồm 3 môn, 6 lớp và 5 hồ sơ thành viên. Có chọn môn, tìm lớp, sao chép mã, tìm thành viên và xác nhận xóa. Tên môn/lớp tối đa 200 ký tự, mô tả tối đa 1.000 ký tự.
- **Ngân hàng câu hỏi** có 3 câu hỏi của Lập trình Web. Chọn môn khác hoặc bộ lọc chưa có dữ liệu sẽ hiện trạng thái rỗng. Form có 4 lựa chọn và 1 đáp án đúng. Khu vực Excel hỗ trợ chọn/kéo thả một tệp `.xlsx`, kiểm tra đuôi tệp và dung lượng tối đa 5 MiB. Tệp được chọn ở trạng thái chờ kiểm tra nội dung. Nút nhập được khóa tới khi tích hợp kiểm tra toàn bộ nội dung.
- **Mẫu Excel** có sheet `CauHoi` và 7 cột theo F16. Tối đa 1.000 dòng dữ liệu là điều kiện để xử lý khi tích hợp nhập Excel. Tệp mẫu chỉ có hàng tiêu đề để điền câu hỏi.
- **Tạo đề** dùng bộ 5 câu hỏi. Có kiểm tra cơ cấu, cảnh báo khi thiếu câu và hai công tắc trộn độc lập. Lưu nháp yêu cầu tên hợp lệ. Công bố yêu cầu lịch/thời lượng hợp lệ, chưa tới giờ đóng và ít nhất một lớp. Lịch mặc định là 13/11/2026, giờ Việt Nam. Khi lịch đã qua giờ đóng, cần chọn lịch mới trước khi công bố.
- **Thống kê** có 6 sinh viên không trùng thuộc L_A1/L_A2 và đủ 3 trạng thái. KPI/biểu đồ tính từ các dòng khớp bộ lọc. Trung bình chỉ dùng lượt hoàn tất, gồm điểm 0, hiển thị 2 chữ số thập phân với dấu phẩy. Khi chưa có lượt hoàn tất, trung bình hiển thị `—`. Trạng thái đang mở dùng mốc 10/11/2026 08:40; đã đóng dùng mốc 09:00 và chuyển lượt đang làm sang hoàn tất do hết giờ. Công tắc công bố đáp án chỉ mở ở trạng thái đã đóng.
- **CSV** tải xuống từ các dòng đang lọc, có UTF-8 BOM, bao/thoát dấu nháy và trung hòa văn bản có thể bị hiểu là công thức. Điểm và kết quả chưa có được để trống. CSV có tiêu đề kể cả khi bộ lọc rỗng.

Thông báo của trình duyệt hoặc quyền clipboard có thể ảnh hưởng thao tác sao chép. Khi sao chép tự động thất bại, giao diện hiện mã để sao chép thủ công.

### Trạng thái tích hợp

Bộ lọc, KPI và CSV xử lý ở trình duyệt từ dữ liệu trong HTML. Các biểu mẫu hiện xác thực và hiển thị xác nhận, chưa gửi yêu cầu lưu lên máy chủ. Nhật ký lỗi Excel ban đầu được khai báo trong HTML; nội dung tệp mới chưa được đọc/kiểm tra. Hồ sơ và đăng xuất chưa được kết nối. Khi tích hợp Servlet/JSP, quyền truy cập, giờ máy chủ, dữ liệu ngân hàng, việc lưu/công bố/nhập Excel và thống kê chính thức cần được xử lý ở máy chủ theo tài liệu dự án.

## Tái sử dụng thành phần

Nạp CSS theo thứ tự `variables.css`, `base.css`, `layout.css`, `components.css`, rồi CSS của sidebar/trang, `animations.css`, `responsive.css` và `workspace.css`. Nạp `motion.js`, `ui.js` với `defer`. Trang giáo viên nạp tiếp `teacher-sidebar.js` rồi JavaScript của trang.

Sidebar giáo viên dùng `aside[data-teacher-sidebar]` với `data-current-page` trùng tên trang. Đặt thông tin trường trong `[data-sidebar-workspace]`, tài khoản trong `[data-sidebar-user]` và vùng thông báo `#teacher-feedback` trong HTML. `teacher-sidebar.js` ghép phần điều hướng dùng chung và chọn mục hiện tại. `QuizFlowTeacher` cung cấp thông báo và chuẩn hóa tìm kiếm tiếng Việt.

Modal và drawer dùng thẻ `<dialog>`. Nút có `data-dialog-open="id"` để mở, `data-dialog-close` để đóng. Công tắc dùng `data-toggle`, `role="switch"` và `aria-checked`. Nút sao chép mã lớp dùng `data-copy="mã lớp"`.

## Chuyển động và micro-interaction

`animations.css` chứa biến thời gian/easing, keyframes và tiện ích chung. Trang Tổng quan dùng CSS để chuyển động minh họa tập đề. Các trang nghiệp vụ dùng `motion.js` để tạo hiệu ứng vào cho sidebar, reveal thẻ một lần bằng `IntersectionObserver`, spotlight theo chuột và nghiêng thẻ có `data-motion-tilt`. Hiệu ứng riêng của mỗi màn hình nằm trong CSS/JS của màn hình đó và dùng lại keyframes chung khi phù hợp.

### Biến dùng chung

| Biến | Giá trị | Công dụng |
| --- | --- | --- |
| `--dur-fast` | `120ms` | Nhấn nút, rung nhẹ, phản hồi nhanh |
| `--dur-base` | `220ms` | Fade, pop, cuộn số, modal |
| `--dur-slow` | `400ms` | Sidebar, drawer, dock, sóng emerald |
| `--dur-hero` | `700ms` | Quét sáng, mốc cho glow và viền chạy |
| `--dur-count` | `900ms` | Count-up KPI |
| `--dur-toast` | `4500ms` | Thời gian hiện toast và thanh đếm ngược |
| `--dur-copy` | `2100ms` | Thời gian giữ nhãn “Đã sao chép” |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Vào trang, đóng/mở, count-up |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Toggle và chip |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Glow, rung |
| `--ease-linear` | `linear` | Viền xoay, thanh thời gian toast |
| `--motion-stagger-step` | `50ms` | Khoảng cách reveal thẻ/hàng bảng |
| `--motion-delay` | `0ms` | Độ trễ mặc định, được stagger ghi đè |
| `--motion-accent` | `#8b5cf633` | Màu lớp glow chung |

Thời gian JavaScript đọc từ biến CSS, không đặt một hằng thời gian riêng. Các hiệu ứng dài hơn dùng `calc()` từ biến chung. `--i` là chỉ số stagger, `--mx`/`--my` là tọa độ spotlight; các biến `--tilt-*`, `--row-*`, `--overlay-*` lưu trạng thái tạm và được dọn khi kết thúc/hủy hiệu ứng.

### Thêm hiệu ứng mới

1. Dùng lại `.anim-fade-up`, `.anim-fade-in`, `.anim-scale-in`, `.anim-slide-in-right`, `.anim-pulse-soft`, `.anim-shimmer`, `.anim-glow-breathe` hoặc `.anim-stagger`. Thẻ `.glass-card` trong nội dung được reveal tự động; không gắn thêm reveal trùng lên thẻ đó. `.anim-stagger` nhận `--i` bắt đầu từ 0, đặt bằng `element.style.setProperty('--i', String(index))`.
2. Nếu cần keyframes mới, đặt hiệu ứng dùng chung trong `animations.css`; hiệu ứng đặc thù nằm trong CSS của trang. Thời lượng/easing lấy từ biến chung. Thêm comment ngắn tiếng Việt và dùng số lượt hữu hạn.
3. Hiệu ứng có JavaScript kiểm tra `QuizFlowMotion.reducedMotion` hoặc `matchMedia('(prefers-reduced-motion: reduce)')`. Theo dõi sự kiện `change` để hủy RAF/animation đang chạy, dọn lớp/biến tạm và hiện trạng thái cuối ngay khi người dùng đổi tùy chọn.
4. Dùng `animation.finished`/`Promise.allSettled()` để dọn hiệu ứng kể cả khi bị hủy. Lượt thao tác mới phải thay thế lượt cũ; không trì hoãn lọc, cập nhật giá trị hay xác thực để chờ animation. Reveal chỉ chạy một lần, focus bàn phím bỏ qua phần chờ.
5. Kiểm tra chuột, bàn phím, thao tác liên tiếp, kết quả rỗng và bật/tắt Reduce motion trong phiên xem. Giữ icon, nhãn, `aria-*` và focus ring; lớp trang trí dùng `aria-hidden="true"` và `pointer-events: none`.

Đóng dialog từ logic của trang bằng `await QuizFlowUI.closeDialog(dialog, 'confirm')`; chỉ tiếp tục phản hồi sau khi Promise trả `true`. API giữ dialog trên top layer trong lúc đóng và trả focus về nút mở. Nút đóng, Esc, click nền và form `method="dialog"` đi cùng luồng này. Tránh gọi `dialog.close()` trực tiếp từ thao tác giao diện. `QuizFlowUI.showToast(message, options)` dùng chung cho thông báo; `QuizFlowTeacher.showFeedback()` chuyển phản hồi trang giáo viên đến API đó.

KPI thống kê có giá trị thật cập nhật ngay theo bộ lọc và một lớp count-up `aria-hidden`. Trình đọc màn hình đọc kết quả cuối; CSV dùng dữ liệu dòng, không lấy số trung gian đang đếm. Khi không có lượt hoàn tất, trung bình vẫn là `—`.

### Hiệu năng và trợ năng

- Keyframes hiện dùng `transform`, `opacity`, `filter`. Giới hạn `box-shadow` ở phản hồi component nhỏ; glow lớn dùng bóng tĩnh trên lớp phủ rồi đổi opacity. Không animate kích thước, vị trí layout, màu nền, gradient hoặc `backdrop-filter`.
- Không đặt `transition: all` hoặc `will-change` đại trà. Spotlight dùng một RAF đang chờ, đọc khung rồi cập nhật biến cho thẻ dưới chuột; hủy frame khi rời thẻ, cuộn, mất focus cửa sổ hoặc bật Reduce motion.
- Biểu tượng “Đang mở/Đang làm” lặp chuyển động để thể hiện trạng thái. Glow mã lớp/cảnh báo, viền chạy, shimmer, nút công bố và các phản hồi khác có số lượt hữu hạn; không thêm vòng lặp trang trí không cần thiết.
- `@media (prefers-reduced-motion: reduce)` tắt animation/transition trên phần tử, pseudo-element và backdrop; tắt nền động/spotlight, hiện nội dung ngay. JavaScript dừng các hiệu ứng đang chạy. Bật lại chuyển động không phát lại các reveal đã xem.
- Giữ chỗ số liệu bằng nguồn giá trị thật, đặt lớp số chuyển động tuyệt đối để tránh layout shift. `scrollbar-gutter: stable` giữ chiều rộng nội dung khi modal khóa cuộn. Biểu đồ và bảng phải nằm trong khung fluid; bảng rộng chỉ cuộn bên trong `.table-scroll`.
- Mục tiêu là 60fps; kết quả còn phụ thuộc thiết bị, trình duyệt và GPU. Khi bổ sung hiệu ứng, dùng Performance/Rendering để kiểm tra frame dài, layout shift và vùng repaint, đặc biệt ở khung 2560px. Không coi kiểm tra headless là bảo đảm tốc độ trên mọi máy.

### Kiểm tra thủ công

Mở cả 5 màn hình ở 1280, 1440, 1920 và 2560px: nền phủ hết cửa sổ, không cuộn ngang toàn trang, bảng rộng cuộn nội bộ. Cuộn xuống/lên để xác nhận reveal không lặp. Thử lọc/tìm liên tiếp, chỉnh số câu, kéo file vào/ra dropzone và đổi trạng thái đề khi KPI đang đếm.

Dùng Tab/Shift+Tab trong modal và drawer, thử Esc, click nền, nút đóng và mở lại ngay khi đang đóng; focus phải ở trong dialog khi mở và trở về nút mở khi đóng. Bật Reduce motion trong hệ điều hành hoặc DevTools rồi tải lại; thử đổi tùy chọn ngay trong lúc hiệu ứng đang chạy. Nội dung, bộ lọc, sao chép và thao tác dialog phải hoạt động, không phụ thuộc chuyển động.

## Tài liệu tham chiếu

- Yêu cầu nghiệp vụ: `../docs/*.md`.
- Ảnh thiết kế: `../docs/design/`.
- HTML thiết kế tham khảo: `../HtmlDesignFile/`.

Các tệp tham chiếu và các màn hình do Sơn phụ trách được giữ nguyên.

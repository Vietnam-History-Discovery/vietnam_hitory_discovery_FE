import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import TableOfContents from '../components/articles/TableOfContents'

const TOC_SECTIONS = [
  { id: 'dieu-khoan', title: 'Điều khoản sử dụng chung' },
  { id: 'hanh-vi-bi-cam', title: 'Các hành vi bị cấm' },
  { id: 'chinh-sach-ai', title: 'Chính sách AI' },
  { id: 'khoa-tai-khoan', title: 'Chính sách khóa tài khoản' },
  { id: 'quyen-rieng-tu', title: 'Quyền riêng tư' },
  { id: 'lien-he', title: 'Liên hệ' },
]

const PROHIBITED_GROUPS = [
  {
    icon: '🚫',
    title: 'Nội dung vi phạm pháp luật',
    items: [
      'Sử dụng AI để tạo nội dung vi phạm pháp luật Việt Nam',
      'Kích động bạo lực, thù hận, phân biệt đối xử',
      'Tuyên truyền nội dung trái với quy định nhà nước',
    ],
  },
  {
    icon: '⚡',
    title: 'Lạm dụng hệ thống',
    items: [
      'Spam câu hỏi liên tục gây quá tải máy chủ',
      'Sử dụng bot hoặc script tự động để gửi yêu cầu hàng loạt',
      'Cố gắng vượt giới hạn sử dụng miễn phí bằng mọi hình thức',
    ],
  },
  {
    icon: '🔓',
    title: 'Tấn công hoặc khai thác hệ thống',
    items: [
      'Thử truy cập trái phép vào cơ sở dữ liệu hoặc hệ thống nội bộ',
      'Khai thác lỗ hổng bảo mật để lấy dữ liệu hoặc phá hoại dịch vụ',
      'Reverse engineering hoặc can thiệp vào hoạt động của AI',
    ],
  },
  {
    icon: '©️',
    title: 'Vi phạm bản quyền & tài khoản',
    items: [
      'Sao chép, phân phối tài liệu trên website khi không được cho phép',
      'Tái sử dụng dữ liệu cho mục đích thương mại mà không có sự đồng ý',
      'Tạo nhiều tài khoản nhằm né tránh các hình thức xử lý vi phạm',
    ],
  },
]

const AI_CARDS = [
  { icon: '📚', title: 'Nguồn tài liệu', text: 'Dựa trên sử liệu gốc được kiểm chứng' },
  { icon: '⚠️', title: 'Giới hạn', text: 'AI có thể sai hoặc thiếu thông tin' },
  { icon: '🎓', title: 'Khuyến nghị', text: 'Tham khảo tài liệu gốc khi dùng cho học thuật' },
]

const VIOLATION_ROWS = [
  { violation: 'Spam hoặc gửi yêu cầu quá mức', action: 'Cảnh báo hoặc khóa tạm', color: 'text-yellow-400' },
  { violation: 'Sử dụng bot tự động', action: 'Khóa 7–30 ngày', color: 'text-orange-400' },
  { violation: 'Cố tình khai thác lỗ hổng hệ thống', action: 'Khóa vĩnh viễn', color: 'text-red-400' },
  { violation: 'Truy cập trái phép dữ liệu', action: 'Khóa vĩnh viễn', color: 'text-red-400' },
  { violation: 'Tái phạm nhiều lần', action: 'Khóa vĩnh viễn', color: 'text-red-400' },
]

const CONTACT_CARDS = [
  { icon: '📧', title: 'Email hỗ trợ', text: 'support@vietnamchronicles.edu.vn' },
  { icon: '🐛', title: 'Báo lỗi', text: 'Tạo issue trên GitHub repository' },
  { icon: '⏱️', title: 'Thời gian phản hồi', text: 'Trong vòng 2-3 ngày làm việc' },
]

function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-1 h-6 rounded-full bg-primary shrink-0" />
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
    </div>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-surface2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-primary font-bold tracking-[0.2em] text-sm uppercase shrink-0">
              Vietnam Chronicles
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-surface2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">Chính sách sử dụng</h1>
          <p className="text-gray-400 mt-3 text-sm sm:text-base max-w-xl mx-auto">
            Vui lòng đọc kỹ các điều khoản trước khi sử dụng Vietnam Chronicles
          </p>
          <p className="text-xs text-gray-600 mt-4 uppercase tracking-wider">
            Cập nhật lần cuối: Tháng 7, 2026
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10 lg:items-start">
          <div className="min-w-0">
            {/* Mobile TOC */}
            <div className="lg:hidden">
              <TableOfContents sections={TOC_SECTIONS} variant="accordion" />
            </div>

            <div className="space-y-10">
              {/* Section 1 */}
              <section id="dieu-khoan" className="scroll-mt-24">
                <SectionHeading title="1. Điều khoản sử dụng chung" />
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Vietnam Chronicles là nền tảng học tập và nghiên cứu lịch sử Việt Nam. Bằng việc sử
                  dụng dịch vụ, người dùng đồng ý tuân thủ các điều khoản dưới đây. Chúng tôi có quyền
                  cập nhật điều khoản mà không cần thông báo trước.
                </p>
                <BulletList
                  items={[
                    'Người dùng phải sử dụng hệ thống đúng mục đích học tập và nghiên cứu',
                    'Tôn trọng nội dung học thuật và nguồn tài liệu lịch sử gốc',
                    'Không chia sẻ thông tin sai lệch hoặc xuyên tạc lịch sử',
                    'Chịu trách nhiệm về mọi nội dung do mình tạo ra hoặc chia sẻ',
                  ]}
                />
              </section>

              <hr className="border-surface2" />

              {/* Section 2 */}
              <section id="hanh-vi-bi-cam" className="scroll-mt-24">
                <SectionHeading title="2. Các hành vi bị cấm" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PROHIBITED_GROUPS.map((group, i) => (
                    <div key={group.title} className="bg-surface border border-surface2 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{group.icon}</span>
                        <h3 className="text-sm font-semibold text-gray-100">
                          2.{i + 1} {group.title}
                        </h3>
                      </div>
                      <BulletList items={group.items} />
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-surface2" />

              {/* Section 3 */}
              <section id="chinh-sach-ai" className="scroll-mt-24">
                <SectionHeading title="3. Chính sách AI" />
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 mb-5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    AI được xây dựng để trả lời dựa trên nguồn tài liệu lịch sử có trong hệ thống, bao
                    gồm <strong className="text-primary font-semibold">Đại Việt Sử Ký Toàn Thư</strong> và{' '}
                    <strong className="text-primary font-semibold">Việt Nam Sử Lược</strong>. Kết quả trả
                    lời có thể không hoàn toàn chính xác hoặc đầy đủ.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AI_CARDS.map((card) => (
                    <div key={card.title} className="bg-surface border border-surface2 rounded-xl p-5">
                      <span className="text-lg">{card.icon}</span>
                      <h3 className="text-sm font-semibold text-gray-100 mt-2 mb-1">{card.title}</h3>
                      <p className="text-sm text-gray-400">{card.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-surface2" />

              {/* Section 4 */}
              <section id="khoa-tai-khoan" className="scroll-mt-24">
                <SectionHeading title="4. Chính sách khóa tài khoản" />
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Tài khoản vi phạm có thể bị hạn chế hoặc khóa mà không cần thông báo trước.
                </p>
                <div className="bg-surface border border-surface2 rounded-xl overflow-hidden mb-5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface2">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wider text-gray-500 font-medium">
                            Hành vi vi phạm
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wider text-gray-500 font-medium">
                            Hình thức xử lý
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {VIOLATION_ROWS.map((row) => (
                          <tr
                            key={row.violation}
                            className="border-b border-surface2 last:border-b-0 hover:bg-surface2/40 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-300">{row.violation}</td>
                            <td className={`px-4 py-3 font-medium ${row.color}`}>{row.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                  <p className="text-sm text-red-300 leading-relaxed">
                    Khi tài khoản bị khóa, bạn sẽ nhận được thông báo lý do cụ thể. Vui lòng liên hệ để
                    được hỗ trợ khiếu nại.
                  </p>
                </div>
              </section>

              <hr className="border-surface2" />

              {/* Section 5 */}
              <section id="quyen-rieng-tu" className="scroll-mt-24">
                <SectionHeading title="5. Quyền riêng tư" />
                <BulletList
                  items={[
                    'Thông tin cá nhân (email, username) được lưu trữ bảo mật trên Firebase',
                    'Chúng tôi không chia sẻ dữ liệu người dùng với bên thứ ba vì mục đích thương mại',
                    'Lịch sử chat được lưu để cải thiện trải nghiệm và có thể bị xóa theo yêu cầu',
                    'Người dùng có quyền yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan',
                  ]}
                />
              </section>

              <hr className="border-surface2" />

              {/* Section 6 */}
              <section id="lien-he" className="scroll-mt-24 bg-surface border border-surface2 rounded-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-100">Cần hỗ trợ?</h2>
                  <p className="text-sm text-gray-400 mt-1.5 max-w-md mx-auto">
                    Nếu bạn có thắc mắc về chính sách hoặc muốn khiếu nại về tài khoản, hãy liên hệ với
                    chúng tôi.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {CONTACT_CARDS.map((card) => (
                    <div key={card.title} className="bg-surface2 border border-surface2 rounded-xl p-5 text-center">
                      <span className="text-lg">{card.icon}</span>
                      <h3 className="text-sm font-semibold text-gray-100 mt-2 mb-1">{card.title}</h3>
                      <p className="text-sm text-gray-400">{card.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Desktop TOC sidebar */}
          <div className="hidden lg:block sticky top-20 self-start">
            <TableOfContents sections={TOC_SECTIONS} variant="sidebar" />
          </div>
        </div>

        <footer className="text-center text-xs text-gray-600 mt-16 pt-8 border-t border-surface2">
          © 2026 Vietnam Chronicles. Nền tảng học tập và nghiên cứu lịch sử Việt Nam.
        </footer>
      </main>
    </div>
  )
}

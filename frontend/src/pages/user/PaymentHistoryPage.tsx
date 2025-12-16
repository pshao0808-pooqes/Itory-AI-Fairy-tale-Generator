import { ChevronLeft, Receipt, Download, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/PaymentHistoryPage.css'

interface PaymentHistoryPageProps {
    onNavigate: (page: PageType) => void
    onGoBack: () => void
    onMenuClick: () => void
}

export default function PaymentHistoryPage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick }: PaymentHistoryPageProps) {
    // 더미 결제 내역 데이터
    const paymentHistory = [
        {
            id: 1,
            date: '2024.11.15',
            description: '프리미엄 구독 (월간)',
            amount: 9900,
            status: 'completed',
            card: '신한카드 1234'
        },
        {
            id: 2,
            date: '2024.10.15',
            description: '프리미엄 구독 (월간)',
            amount: 9900,
            status: 'completed',
            card: '신한카드 1234'
        },
        {
            id: 3,
            date: '2024.09.15',
            description: '프리미엄 구독 (월간)',
            amount: 9900,
            status: 'completed',
            card: '신한카드 1234'
        },
        {
            id: 4,
            date: '2024.08.15',
            description: '프리미엄 구독 (월간)',
            amount: 9900,
            status: 'completed',
            card: '삼성카드 5678'
        },
    ]

    const formatAmount = (amount: number) => {
        return amount.toLocaleString() + '원'
    }

    const totalAmount = paymentHistory.reduce((sum, item) => sum + item.amount, 0)

    return (
        <div className="payment-history-page">
            {/* 배경 구름 */}
            <div className="payment-history-page__bg-decorations">
                <div className="payment-history-page__cloud payment-history-page__cloud--1"></div>
                <div className="payment-history-page__cloud payment-history-page__cloud--2"></div>
                <div className="payment-history-page__cloud payment-history-page__cloud--3"></div>
            </div>

            {/* 헤더 */}
            <header className="payment-history-page__header">
                <button onClick={onGoBack} className="payment-history-page__back-btn">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="payment-history-page__header-title">결제 내역</h1>
                <div style={{ width: 48 }} />
            </header>

            <main className="payment-history-page__content">
                <p className="payment-history-page__description">
                    <Receipt size={18} color="#9C27B0" />
                    지난 결제 내역을 확인할 수 있어요
                </p>

                {/* 결제 요약 */}
                <div className="payment-history-page__summary">
                    <div className="payment-history-page__summary-card">
                        <div className="payment-history-page__summary-icon payment-history-page__summary-icon--blue">
                            <Calendar size={20} />
                        </div>
                        <div className="payment-history-page__summary-content">
                            <span className="payment-history-page__summary-label">이번 달 결제</span>
                            <span className="payment-history-page__summary-value">9,900원</span>
                        </div>
                    </div>
                    <div className="payment-history-page__summary-card">
                        <div className="payment-history-page__summary-icon payment-history-page__summary-icon--green">
                            <TrendingUp size={20} />
                        </div>
                        <div className="payment-history-page__summary-content">
                            <span className="payment-history-page__summary-label">총 결제 금액</span>
                            <span className="payment-history-page__summary-value">{formatAmount(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* 결제 내역 목록 */}
                <div className="payment-history-page__section">
                    <div className="payment-history-page__section-header">
                        <h3 className="payment-history-page__section-title">
                            <span className="payment-history-page__section-icon">🧾</span>
                            최근 결제 내역
                        </h3>
                        <span className="payment-history-page__count">{paymentHistory.length}건</span>
                    </div>

                    <div className="payment-history-page__list">
                        {paymentHistory.map((item) => (
                            <div key={item.id} className="payment-history-page__item">
                                <div className="payment-history-page__item-icon">
                                    <Receipt size={20} />
                                </div>
                                <div className="payment-history-page__item-info">
                                    <h4 className="payment-history-page__item-desc">{item.description}</h4>
                                    <p className="payment-history-page__item-meta">
                                        <span className="payment-history-page__item-date">{item.date}</span>
                                        <span className="payment-history-page__item-divider">·</span>
                                        <span className="payment-history-page__item-card">
                                            <CreditCard size={12} />
                                            {item.card}
                                        </span>
                                    </p>
                                </div>
                                <div className="payment-history-page__item-right">
                                    <span className="payment-history-page__item-amount">{formatAmount(item.amount)}</span>
                                    <span className="payment-history-page__item-status">결제완료</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 영수증 다운로드 */}
                <button className="payment-history-page__download-btn">
                    <Download size={20} />
                    전체 내역 다운로드
                </button>

                {/* 안내 문구 */}
                <div className="payment-history-page__notice">
                    <p>💡 결제 관련 문의는 고객센터로 연락해주세요.</p>
                    <p>환불은 결제일로부터 7일 이내 가능합니다.</p>
                </div>
            </main>

            {/* 하단 풍경 장식 */}
            <div className="payment-history-page__landscape">
                <div className="payment-history-page__grass"></div>
                <div className="payment-history-page__tree payment-history-page__tree--1"></div>
                <div className="payment-history-page__tree payment-history-page__tree--2"></div>
                <div className="payment-history-page__bush payment-history-page__bush--1"></div>
                <div className="payment-history-page__bush payment-history-page__bush--2"></div>
                <div className="payment-history-page__bush payment-history-page__bush--3"></div>
                <div className="payment-history-page__flower payment-history-page__flower--1"></div>
                <div className="payment-history-page__flower payment-history-page__flower--2"></div>
                <div className="payment-history-page__flower payment-history-page__flower--3"></div>
            </div>
        </div>
    )
}
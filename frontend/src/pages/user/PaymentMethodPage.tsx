import { ChevronLeft, CreditCard, Plus, Trash2, Check, Shield } from 'lucide-react'
import { PageType } from '../../App'
import '../../styles/pages/PaymentMethodPage.css'

interface PaymentMethodPageProps {
    onNavigate: (page: PageType) => void
    onGoBack: () => void
    onMenuClick: () => void
}

export default function PaymentMethodPage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick }: PaymentMethodPageProps) {
    // 더미 결제수단 데이터
    const paymentMethods = [
        { id: 1, type: 'card', name: '신한카드', last4: '1234', isDefault: true },
        { id: 2, type: 'card', name: '삼성카드', last4: '5678', isDefault: false },
    ]

    return (
        <div className="payment-method-page">
            {/* 배경 구름 */}
            <div className="payment-method-page__bg-decorations">
                <div className="payment-method-page__cloud payment-method-page__cloud--1"></div>
                <div className="payment-method-page__cloud payment-method-page__cloud--2"></div>
                <div className="payment-method-page__cloud payment-method-page__cloud--3"></div>
            </div>

            {/* 헤더 */}
            <header className="payment-method-page__header">
                <button onClick={onGoBack} className="payment-method-page__back-btn">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="payment-method-page__header-title">결제수단 관리</h1>
                <div style={{ width: 48 }} />
            </header>

            <main className="payment-method-page__content">
                <p className="payment-method-page__description">
                    <CreditCard size={18} color="#2196F3" />
                    동화 제작에 사용할 결제수단을 관리해요
                </p>

                {/* 등록된 결제수단 목록 */}
                <div className="payment-method-page__section">
                    <h3 className="payment-method-page__section-title">
                        <span className="payment-method-page__section-icon">💳</span>
                        등록된 결제수단
                    </h3>

                    <div className="payment-method-page__list">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`payment-method-page__card ${method.isDefault ? 'payment-method-page__card--default' : ''}`}
                            >
                                <div className="payment-method-page__card-icon">
                                    <CreditCard size={24} />
                                </div>
                                <div className="payment-method-page__card-info">
                                    <h4 className="payment-method-page__card-name">{method.name}</h4>
                                    <p className="payment-method-page__card-number">**** **** **** {method.last4}</p>
                                </div>
                                {method.isDefault ? (
                                    <span className="payment-method-page__default-badge">
                                        <Check size={14} /> 기본
                                    </span>
                                ) : (
                                    <div className="payment-method-page__card-actions">
                                        <button className="payment-method-page__set-default-btn">
                                            기본 설정
                                        </button>
                                        <button className="payment-method-page__delete-btn">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 새 결제수단 추가 */}
                    <button className="payment-method-page__add-btn">
                        <div className="payment-method-page__add-icon">
                            <Plus size={24} />
                        </div>
                        <div className="payment-method-page__add-content">
                            <span className="payment-method-page__add-title">새 결제수단 추가</span>
                            <span className="payment-method-page__add-desc">신용카드, 체크카드 등록</span>
                        </div>
                        <ChevronLeft size={20} color="#C4B8A8" style={{ transform: 'rotate(180deg)' }} />
                    </button>
                </div>

                {/* 안내 문구 */}
                <div className="payment-method-page__notice">
                    <div className="payment-method-page__notice-icon">
                        <Shield size={20} color="#4CAF50" />
                    </div>
                    <div className="payment-method-page__notice-content">
                        <p className="payment-method-page__notice-title">안전한 결제 보장</p>
                        <p>결제수단 정보는 안전하게 암호화되어 저장됩니다.</p>
                        <p>기본 결제수단은 구독 갱신 시 자동으로 사용됩니다.</p>
                    </div>
                </div>
            </main>

            {/* 하단 풍경 장식 */}
            <div className="payment-method-page__landscape">
                <div className="payment-method-page__grass"></div>
                <div className="payment-method-page__tree payment-method-page__tree--1"></div>
                <div className="payment-method-page__tree payment-method-page__tree--2"></div>
                <div className="payment-method-page__bush payment-method-page__bush--1"></div>
                <div className="payment-method-page__bush payment-method-page__bush--2"></div>
                <div className="payment-method-page__bush payment-method-page__bush--3"></div>
                <div className="payment-method-page__flower payment-method-page__flower--1"></div>
                <div className="payment-method-page__flower payment-method-page__flower--2"></div>
                <div className="payment-method-page__flower payment-method-page__flower--3"></div>
            </div>
        </div>
    )
}
import { ChevronLeft, Check, Star, Zap, Crown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PageType, User, SubscriptionTier } from '../../App'
import '../../styles/pages/SubscriptionPlanPage.css'

interface SubscriptionPlanPageProps {
    onNavigate: (page: PageType) => void
    onGoBack: () => void
    onMenuClick: () => void
    userInfo: User
}

export default function SubscriptionPlanPage({ onNavigate: _onNavigate, onGoBack, onMenuClick: _onMenuClick, userInfo }: SubscriptionPlanPageProps) {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(userInfo.subscription_tier)

    // 현재 사용자 상태
    const currentPlan = userInfo.subscription_tier
    const freeTrialUsed = userInfo.free_trial_used

    const plans = [
        {
            id: 'BASIC' as SubscriptionTier,
            name: '베이직',
            emoji: '🌱',
            icon: Star,
            price: 0,
            priceLabel: '무료',
            features: [
                freeTrialUsed ? '무료 체험 사용 완료' : '1회 무료 생성',
                '기본 그림체 3종',
                '720p 화질',
                '워터마크 포함',
            ],
            color: '#9E9E9E',
            bgColor: '#F5F5F5',
            disabled: freeTrialUsed && currentPlan === 'BASIC',
        },
        {
            id: 'PREMIUM' as SubscriptionTier,
            name: '프리미엄',
            emoji: '⭐',
            icon: Zap,
            price: 19800,
            priceLabel: '19,800원',
            priceSuffix: '/월',
            features: [
                '월 10회 동화 생성',
                '모든 그림체 선택 가능',
                '1080p HD 화질',
                '워터마크 없음',
                '다운로드 가능',
                '우선 생성 지원',
                '피드백 리포트 제공',
            ],
            color: '#4CAF50',
            bgColor: '#E8F5E9',
            popular: true,
        },
    ]

    const handleSelectPlan = (planId: SubscriptionTier) => {
        const plan = plans.find(p => p.id === planId)
        if (plan?.disabled) return
        setSelectedPlan(planId)
    }

    const getButtonText = () => {
        if (selectedPlan === currentPlan) {
            return '현재 사용 중인 플랜입니다'
        }
        if (selectedPlan === 'PREMIUM') {
            return '프리미엄 구독하기 (월 19,800원)'
        }
        if (selectedPlan === 'BASIC') {
            return '베이직으로 변경하기'
        }
        return '플랜 선택하기'
    }

    return (
        <div className="subscription-plan-page">
            {/* 배경 구름 */}
            <div className="subscription-plan-page__bg-decorations">
                <div className="subscription-plan-page__cloud subscription-plan-page__cloud--1"></div>
                <div className="subscription-plan-page__cloud subscription-plan-page__cloud--2"></div>
                <div className="subscription-plan-page__cloud subscription-plan-page__cloud--3"></div>
            </div>

            {/* 헤더 */}
            <header className="subscription-plan-page__header">
                <button onClick={onGoBack} className="subscription-plan-page__back-btn">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="subscription-plan-page__header-title">요금제 선택</h1>
                <div style={{ width: 48 }} />
            </header>

            <main className="subscription-plan-page__content">
                <p className="subscription-plan-page__description">
                    <Sparkles size={18} color="#F5A623" />
                    우리 아이에게 맞는 플랜을 선택해주세요
                </p>

                {/* 플랜 목록 */}
                <div className="subscription-plan-page__list">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`subscription-plan-page__card ${selectedPlan === plan.id ? 'selected' : ''} ${currentPlan === plan.id ? 'current' : ''} ${plan.disabled ? 'disabled' : ''} ${plan.popular ? 'popular' : ''}`}
                            onClick={() => handleSelectPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="subscription-plan-page__popular-badge">
                                    🔥 인기
                                </div>
                            )}
                            {currentPlan === plan.id && (
                                <div className="subscription-plan-page__current-badge">
                                    ✓ 현재 플랜
                                </div>
                            )}

                            <div className="subscription-plan-page__card-header">
                                <span className="subscription-plan-page__card-emoji">{plan.emoji}</span>
                                <div className="subscription-plan-page__card-title-wrap">
                                    <h3 className="subscription-plan-page__card-name">{plan.name}</h3>
                                    <div className="subscription-plan-page__card-price">
                                        <span className="subscription-plan-page__price-value">
                                            {plan.priceLabel}
                                        </span>
                                        {plan.priceSuffix && (
                                            <span className="subscription-plan-page__price-period">
                                                {plan.priceSuffix}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ul className="subscription-plan-page__features">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="subscription-plan-page__feature">
                                        <div className={`subscription-plan-page__feature-icon ${plan.disabled ? 'disabled' : ''}`}>
                                            <Check size={14} />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="subscription-plan-page__select-indicator">
                                {selectedPlan === plan.id && !plan.disabled ? (
                                    <div className="subscription-plan-page__radio selected">
                                        <Check size={14} color="white" />
                                    </div>
                                ) : (
                                    <div className="subscription-plan-page__radio" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 1회 구매 옵션 */}
                <div className="subscription-plan-page__onetime">
                    <div className="subscription-plan-page__onetime-icon">💎</div>
                    <div className="subscription-plan-page__onetime-content">
                        <p className="subscription-plan-page__onetime-title">구독 없이 1회만 이용하고 싶다면?</p>
                        <p className="subscription-plan-page__onetime-desc">부담 없이 한 번만 체험해보세요</p>
                    </div>
                    <button className="subscription-plan-page__onetime-btn">
                        1회 구매<br /><span>4,900원</span>
                    </button>
                </div>

                {/* 변경 버튼 */}
                <button
                    className="subscription-plan-page__change-btn"
                    disabled={selectedPlan === currentPlan}
                >
                    <Crown size={20} />
                    {getButtonText()}
                </button>

                {/* 안내 문구 */}
                <div className="subscription-plan-page__notice">
                    <p>💡 프리미엄 구독은 매월 자동 갱신됩니다.</p>
                    <p>언제든 구독을 해지할 수 있습니다.</p>
                </div>
            </main>

            {/* 하단 풍경 장식 */}
            <div className="subscription-plan-page__landscape">
                <div className="subscription-plan-page__grass"></div>
                <div className="subscription-plan-page__tree subscription-plan-page__tree--1"></div>
                <div className="subscription-plan-page__tree subscription-plan-page__tree--2"></div>
                <div className="subscription-plan-page__bush subscription-plan-page__bush--1"></div>
                <div className="subscription-plan-page__bush subscription-plan-page__bush--2"></div>
                <div className="subscription-plan-page__bush subscription-plan-page__bush--3"></div>
                <div className="subscription-plan-page__flower subscription-plan-page__flower--1"></div>
                <div className="subscription-plan-page__flower subscription-plan-page__flower--2"></div>
                <div className="subscription-plan-page__flower subscription-plan-page__flower--3"></div>
            </div>
        </div>
    )
}
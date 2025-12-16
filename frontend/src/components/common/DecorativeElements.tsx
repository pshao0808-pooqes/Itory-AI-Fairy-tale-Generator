import '../../styles/components/DecorativeElements.css'

// 장식 요소들은 CSS background-image로 대체 예정
// 이 컴포넌트는 CSS 클래스만 제공합니다
export default function DecorativeElements() {
  return (
    <>
      {/* 왼쪽 상단 구름 */}
      <div className="deco-cloud"></div>

      {/* 오른쪽 상단 별 */}
      <div className="deco-star animate-float"></div>

      {/* 왼쪽 하단 나무 */}
      <div className="deco-tree"></div>

      {/* 오른쪽 하단 꽃 */}
      <div className="deco-flower"></div>
    </>
  )
}

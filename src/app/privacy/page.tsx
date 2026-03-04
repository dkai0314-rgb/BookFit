import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

                <p>
                    욜드컴퍼니(YOLDCOMPANY)(이하 “회사”)는 북핏(BookFit) 이용자의 개인정보를 중요하게 생각하며, 관련 법령에 따라 개인정보를 안전하게 처리하고 보호하기 위해 다음과 같이 개인정보처리방침을 수립합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">1. 수집하는 개인정보 항목</h2>
                <p>회사는 서비스 제공을 위해 다음과 같은 정보를 수집할 수 있습니다.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>이름 또는 닉네임</li>
                    <li>이메일 주소</li>
                    <li>결제 관련 정보</li>
                    <li>문의 내용</li>
                    <li>서비스 이용 기록</li>
                    <li>접속 로그, 쿠키, 브라우저 정보, 기기 정보, IP 주소</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">2. 개인정보 수집 및 이용 목적</h2>
                <p>회사는 수집한 개인정보를 다음 목적을 위해 이용합니다.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>상품 구매 및 결제 처리</li>
                    <li>디지털 상품 발송 및 복제 링크 제공</li>
                    <li>고객 문의 응대</li>
                    <li>공지사항 전달</li>
                    <li>서비스 운영 및 개선</li>
                    <li>부정 이용 방지 및 보안 관리</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">3. 개인정보 보유 및 이용기간</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</li>
                    <li>다만, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관할 수 있습니다.</li>
                    <li>전자상거래 관련 기록은 관련 법령에 따라 일정 기간 보관될 수 있습니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">4. 개인정보의 제3자 제공</h2>
                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>이용자가 사전에 동의한 경우</li>
                    <li>법령에 따라 제공 의무가 발생한 경우</li>
                    <li>결제 및 서비스 제공을 위해 필요한 범위 내에서 관련 업체에 제공되는 경우</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">5. 개인정보 처리의 위탁</h2>
                <p>
                    회사는 원활한 서비스 제공을 위해 필요한 경우 일부 업무를 외부에 위탁할 수 있으며, 이 경우 관련 법령에 따라 안전하게 관리합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">6. 이용자의 권리</h2>
                <p>
                    이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지 요청을 할 수 있습니다.
                    관련 요청은 아래 문의처를 통해 접수할 수 있으며, 회사는 지체 없이 처리하도록 노력합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">7. 쿠키의 사용</h2>
                <p>
                    회사는 이용자 편의 향상 및 서비스 분석을 위해 쿠키를 사용할 수 있습니다.
                    이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용에 제한이 발생할 수 있습니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">8. 개인정보 보호를 위한 조치</h2>
                <p>
                    회사는 개인정보의 안전성 확보를 위해 관리적, 기술적 조치를 시행하며, 무단 접근, 유출, 훼손을 방지하기 위해 노력합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">9. 문의처</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li>이메일: <a href="mailto:yoldmore@gmail.com" className="text-emerald-400 hover:underline">yoldmore@gmail.com</a></li>
                    <li>고객문의채널: [카카오톡 채널 / 문의폼 링크 입력]</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">10. 고지 및 변경</h2>
                <p>
                    본 개인정보처리방침은 사이트에 게시한 날부터 적용되며, 관련 법령 또는 서비스 변경에 따라 수정될 수 있습니다.
                </p>
            </div>
        </div>
    );
}

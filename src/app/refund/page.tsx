import React from 'react';

export const metadata = {
    title: '환불 규정 | BookFit',
    description: 'BookFit 디지털 콘텐츠 및 서비스에 대한 환불 규정 안내입니다.',
};

export default function RefundPolicy() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl text-white">
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300">
                <h1 className="text-3xl font-bold mb-6">환불 규정</h1>
                <p className="mb-4">
                    본 환불 규정은 욜드몰(YOLDMORE)(이하 “회사”)가 운영하는 북핏(BookFit)에서 제공하는 디지털 콘텐츠 및 관련 서비스의 환불에 관한 사항을 규정함을 목적으로 합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">제1조 (결제 취소 및 환불 기준)</h2>
                <p className="mb-2">1. <strong>디지털 콘텐츠 (E-book, VOD 등)</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>결제 후 <strong>다운로드 및 열람 이력이 없는 경우</strong>에 한하여 결제일로부터 <strong>7일 이내</strong> 100% 환불이 가능합니다.</li>
                    <li>콘텐츠의 특성상 <strong>단 1회라도 다운로드하거나 열람한 경우(스트리밍 포함)</strong>에는 이미 상품의 가치가 훼손된 것으로 간주하여 전자상거래법 제17조 제2항 제5호에 따라 <strong>환불이 원칙적으로 불가</strong>합니다.</li>
                    <li>단, 회사가 제공한 파일에 중대한 기술적 결함(오류, 파일 손상 등)이 있어 정상적인 열람이 불가능하고, 회사가 이를 영업일 기준 3일 이내에 수정하여 제공하지 못할 경우에는 전액 환불합니다.</li>
                </ul>
                <p className="mb-2 mt-6">2. <strong>구독형 서비스 (멤버십 등)</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>정기 결제 전:</strong> 다음 결제 예정일 1일 전까지 구독을 해지할 수 있으며, 이 경우 다음 결제일부터 청구되지 않습니다.</li>
                    <li><strong>결제 후 (미사용):</strong> 구독 결제 후 <strong>7일 이내에 서비스(콘텐츠 열람 등)를 전혀 이용하지 않은 경우</strong> 전액 환불이 가능합니다.</li>
                    <li><strong>결제 후 (사용):</strong> 구독 결제 후 7일이 경과하거나 1회 이상 서비스를 이용한 경우, 해당 월의 결제 금액은 환불되지 않으며 다음 결제일부터 구독이 해지됩니다.</li>
                </ul>
                <p className="mb-2 mt-6">3. <strong>온/오프라인 컨설팅 및 코칭</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>진행일 <strong>7일 전</strong> 취소 시: 100% 환불</li>
                    <li>진행일 <strong>3일 전</strong> 취소 시: 50% 환불</li>
                    <li>진행일 <strong>2일 전 ~ 당일</strong> 취소 시: <strong>환불 불가</strong></li>
                    <li>노쇼(No-show)의 경우 환불이 불가합니다.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">제2조 (환불 제외 대상)</h2>
                <p className="mb-2">다음의 경우에는 환불이 불가합니다.</p>
                <ol className="list-decimal pl-6 mb-4 space-y-2">
                    <li>이벤트, 프로모션 등을 통해 무상으로 제공받은 콘텐츠 및 서비스</li>
                    <li>회사가 사전에 ‘환불 불가’를 명시하고 이용자가 이에 동의하여 구매한 개별 맞춤형 주문 제작 상품</li>
                    <li>이용자의 귀책사유(계정 공유, 불법 복제, 부정 이용 등)로 인해 이용이 제한되거나 계약이 해지된 경우</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4">제3조 (환불 신청 및 처리 절차)</h2>
                <p className="mb-2">1. <strong>환불 신청 방법:</strong> 환불을 원하는 이용자는 회사의 고객센터(yoldmore@gmail.com)를 통해 환불 요청 사유와 함께 접수해야 합니다.</p>
                <p className="mb-2 mt-4">2. <strong>환불 처리 기간:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>회사는 환불 신청을 확인하고 그 정당성을 심사한 후, 영업일 기준 <strong>3~5일 이내</strong>에 환불 승인 여부를 통보합니다.</li>
                    <li>환불이 승인된 경우, 회사는 동일한 결제 수단으로 환불을 진행합니다. 단, 결제 수단(신용카드, 휴대폰 결제 등)의 제공자(PG사 등) 사정에 따라 실제 환불 처리까지 영업일 기준 추가 3~7일이 소요될 수 있습니다.</li>
                </ul>
                <p className="mb-4 mt-4">3. 동일 결제 수단으로 환불이 불가능한 경우, 회사는 이용자와 협의하여 이용자 명의의 계좌로 현금 환불을 진행할 수 있습니다.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">제4조 (과오납금의 환불)</h2>
                <p className="mb-2">1. 회사의 시스템 오류 등으로 과오납금이 발생한 경우, 회사는 결제 수수료 등 제반 비용에 관계없이 이용자에게 과오납금 전액을 환불합니다.</p>
                <p className="mb-4">2. 이용자의 귀책사유로 과오납금이 발생한 경우, 회사가 환불에 소요되는 수수료 등은 이용자가 부담합니다.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">제5조 (기타)</h2>
                <p className="mb-4">본 환불 규정에 명시되지 않은 사항은 전자상거래 등에서의 소비자보호에 관한 법률, 콘텐츠산업 진흥법 등 관련 법령 및 회사의 이용약관에 따릅니다.</p>
            </div>
        </div>
    );
}

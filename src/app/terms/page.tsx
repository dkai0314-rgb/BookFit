import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="prose prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-8">이용약관</h1>

                <p>
                    본 이용약관은 욜드컴퍼니(YOLDCOMPANY)(이하 “회사”)가 운영하는 북핏(BookFit)에서 제공하는 디지털 콘텐츠 및 관련 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제1조 목적</h2>
                <p>
                    본 약관은 북핏을 통해 제공되는 디지털 상품, 콘텐츠, 정보 제공 서비스 및 관련 제반 서비스의 이용조건과 절차, 회사와 이용자의 권리 및 의무를 정하는 것을 목적으로 합니다.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제2조 정의</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>“사이트”란 회사가 운영하는 북핏(BookFit) 웹사이트를 말합니다.</li>
                    <li>“이용자”란 사이트에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                    <li>“디지털 상품”이란 PDF 파일, 노션 템플릿 복제 링크, 전자문서, 기타 무형의 디지털 콘텐츠를 말합니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제3조 약관의 효력 및 변경</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>본 약관은 사이트에 게시함으로써 효력이 발생합니다.</li>
                    <li>회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                    <li>변경된 약관은 사이트에 공지한 시점부터 효력이 발생합니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제4조 서비스의 제공</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>
                        회사는 다음과 같은 서비스를 제공합니다.
                        <ul className="list-disc pl-6 mt-2">
                            <li>독서 관련 디지털 콘텐츠 제공</li>
                            <li>노션 템플릿 판매 및 복제 링크 제공</li>
                            <li>기타 회사가 정하는 콘텐츠 및 부가 서비스</li>
                        </ul>
                    </li>
                    <li>회사는 운영상 또는 기술상의 필요에 따라 서비스 내용을 변경할 수 있습니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제5조 구매 및 결제</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>이용자는 사이트에서 회사가 정한 절차에 따라 상품을 구매할 수 있습니다.</li>
                    <li>디지털 상품의 특성상 결제 완료 후 즉시 또는 별도로 안내된 방식에 따라 다운로드 링크, 문서 또는 복제 링크가 제공될 수 있습니다.</li>
                    <li>결제 정보의 정확성은 이용자의 책임이며, 잘못된 정보 입력으로 인한 불이익은 이용자가 부담합니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제6조 디지털 상품의 이용</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>회사가 제공하는 디지털 상품은 이용자 개인의 사용을 위한 것입니다.</li>
                    <li>이용자는 회사의 사전 동의 없이 상품을 복제, 재판매, 공유, 배포, 양도, 수정 후 재배포할 수 없습니다.</li>
                    <li>제공된 노션 템플릿 링크 및 파일은 구매자 본인만 사용할 수 있으며, 타인에게 전달하거나 무단 공유하는 행위는 금지됩니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제7조 청약철회 및 환불</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>이용자의 청약철회 및 환불에 관한 사항은 사이트에 별도로 게시된 환불정책을 따릅니다.</li>
                    <li>디지털 상품의 특성상 다운로드, 이메일 발송, 복제 링크 제공 등 콘텐츠 제공이 개시된 이후에는 단순 변심에 의한 환불이 제한될 수 있습니다.</li>
                    <li>다만, 회사의 귀책사유로 상품에 중대한 하자가 있거나 정상적인 이용이 불가능한 경우에는 회사의 환불정책에 따라 처리합니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제8조 회사의 의무</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>회사는 관련 법령과 본 약관이 금지하는 행위를 하지 않으며, 지속적이고 안정적인 서비스 제공을 위해 노력합니다.</li>
                    <li>회사는 이용자로부터 제기되는 정당한 의견이나 불만을 확인하고 합리적으로 처리하도록 노력합니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제9조 이용자의 의무</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>이용자는 관련 법령, 본 약관 및 사이트 내 안내사항을 준수하여야 합니다.</li>
                    <li>이용자는 서비스 이용 과정에서 타인의 권리를 침해하거나 사이트 운영을 방해하는 행위를 해서는 안 됩니다.</li>
                    <li>이용자는 구매한 디지털 상품을 무단 복제, 공유, 재판매해서는 안 됩니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제10조 면책</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>회사는 천재지변, 서버 장애, 불가항력적 사유로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
                    <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
                    <li>회사가 제공하는 콘텐츠는 정보 제공 목적을 포함할 수 있으며, 이용자의 최종 판단과 활용에 대한 책임은 이용자에게 있습니다.</li>
                </ol>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-emerald-400">제11조 분쟁해결 및 관할</h2>
                <p>
                    회사와 이용자 간 분쟁이 발생할 경우 상호 성실히 협의하여 해결하며, 협의가 어려운 경우 관련 법령에 따릅니다.
                </p>
            </div>
        </div>
    );
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const maxDuration = 300;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { paymentKey, orderId, amount, userId, userEmail, userName } = body;

        console.log('[confirm] 결제 승인 요청:', { orderId, amount, userId, userEmail });

        // 1. 토스 시크릿 키 확인
        const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json({ success: false, error: '서버 설정 오류 (Secret Key 누락)' }, { status: 500 });
        }

        const encodedKey = Buffer.from(secretKey + ':').toString('base64');

        // 2. 토스 승인 API 호출
        const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${encodedKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        const tossData = await tossRes.json();

        if (!tossRes.ok) {
            console.error('[confirm] 토스 승인 실패:', tossData);
            return NextResponse.json({ success: false, error: tossData }, { status: tossRes.status });
        }

        // 3. DB 업데이트 (권한 부여) 및 결제 이력 저장
        if (adminDb && userId) {
            const batch = adminDb.batch();

            // 구매한 템플릿 정보 저장
            const templateRef = adminDb.collection('users').doc(userId).collection('templates').doc('bookfit');
            batch.set(templateRef, {
                templateId: 'bookfit',
                title: '독서관 노션 템플릿',
                purchasedAt: FieldValue.serverTimestamp(),
                price: amount,
                orderId: orderId,
                paymentKey: paymentKey,
                status: 'paid'
            });

            // 전체 결제 이력 저장
            const paymentRef = adminDb.collection('payments').doc(orderId);
            batch.set(paymentRef, {
                userId,
                userEmail,
                userName,
                amount,
                orderId,
                paymentKey,
                productName: '독서관 노션 템플릿',
                status: tossData.status,
                createdAt: FieldValue.serverTimestamp(),
                tossData: tossData
            });

            await batch.commit();
            console.log('[confirm] DB 업데이트 완료:', userId);
        }

        // 4. 이메일 발송 등 후속 처리 (필요 시 여기서 호출하거나 클라이언트에서 처리)
        // 일단은 saju-hanjan 패턴을 따라 결제 승인까지만 확실히 처리

        return NextResponse.json({ success: true, data: tossData });

    } catch (error: unknown) {
        console.error('[confirm] 에러 발생:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

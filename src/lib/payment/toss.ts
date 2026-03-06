export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";
export const TOSS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY || "";

/**
 * 토스페이먼츠 결제 승인 API 호출
 * @param paymentKey 클라이언트 결제 승인 후 받은 키
 * @param orderId 주문 번호
 * @param amount 결제 금액
 */
export async function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
        throw new Error("TOSS_PAYMENTS_SECRET_KEY is not defined");
    }

    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${encryptedSecretKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
        }),
    });

    const body = await response.json();

    if (!response.ok) {
        throw new Error(body.message || "Payment confirmation failed");
    }

    return body;
}

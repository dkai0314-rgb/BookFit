import { NextRequest, NextResponse } from "next/server";

const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const BREVO_BASE_URL = process.env.BREVO_BASE_URL || "https://api.brevo.com/v3";
const BREVO_LIST_ID = process.env.BREVO_LIST_ID || "7";

export async function POST(req: NextRequest) {
    try {
        if (!BREVO_API_KEY) {
            console.error("Missing BREVO_API_KEY environment variable");
            return NextResponse.json(
                { error: "뉴스레터 설정 오류 (서버 관리자에게 문의하세요).", missingKey: true },
                { status: 500 }
            );
        }

        const { email, name, listIds } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "이메일이 필요합니다." },
                { status: 400 }
            );
        }

        const targetListIds = listIds || [parseInt(BREVO_LIST_ID, 10)];

        const response = await fetch(`${BREVO_BASE_URL}/contacts`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                email,
                attributes: name ? { FIRSTNAME: name } : undefined,
                listIds: targetListIds,
                updateEnabled: true, // 이미 있는 연락처면 업데이트
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API error:", errorData);
            return NextResponse.json(
                { error: "구독 신청 중 오류가 발생했습니다.", details: errorData },
                { status: response.status }
            );
        }

        // 201 Created or 204 No Content for successful updates
        return NextResponse.json(
            { message: "구독 신청이 완료되었습니다." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Newsletter check subscription error:", error);
        return NextResponse.json(
            {
                error: "서버 연결에 실패했습니다.",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

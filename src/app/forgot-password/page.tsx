import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        비밀번호 재설정
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        가입하신 이메일 주소를 입력하시면<br />비밀번호 재설정 링크를 보내드려용! 🌈
                    </p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}

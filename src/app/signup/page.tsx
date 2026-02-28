import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        회원가입
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        BookFit과 함께 독서 여정을 시작하세요
                    </p>
                </div>
                <SignupForm />
            </div>
        </div>
    );
}

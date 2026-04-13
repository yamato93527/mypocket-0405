"use client";

import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function SignIn() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage =
    error === "OAuthAccountNotLinked"
      ? "同じメールアドレスで別のログイン方法が登録されています。Googleアカウントで再度お試しください。"
      : null;

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "authenticated" && session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative h-20 w-20 mx-auto">
          <Image
            className="object-contain"
            src="/images/icon.png"
            alt="My Pocket Logo"
            fill={true}
            sizes="80px"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          my-pocketにサインイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          記事を保存・管理するためにサインインしてください
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errorMessage ? (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}
          <button
            onClick={() =>
              signIn(
                "google",
                { callbackUrl: "/" },
                { prompt: "select_account" },
              )
            }
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Googleでサインイン
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
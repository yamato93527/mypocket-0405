"use client";

import ExtensionSuccess from "@/app/components/ExtensionSuccess";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const fromExtension = searchParams.get("from") === "extension";

  const errorMessage =
    error === "OAuthAccountNotLinked"
      ? "同じメールアドレスで別のログイン方法が登録されています。Googleアカウントで再度お試しください。"
      : null;

  useEffect(() => {
    if (status === "authenticated" && !fromExtension) {
      router.replace("/");
    }
  }, [fromExtension, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "authenticated" && session) {
    if (fromExtension) {
      return <ExtensionSuccess />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-gray-900 bg-white shadow-sm">
          <Image
            className="object-cover"
            src="/images/icon.png"
            alt="My Pocket Logo"
            fill={true}
            sizes="80px"
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          my-pocketにサインイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {fromExtension
            ? "拡張機能を使用するためにサインインしてください"
            : "記事を保存・管理するためにサインインしてください"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errorMessage ? (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {fromExtension ? (
            <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
              拡張機能からのアクセスです。ログイン後、このページは自動で閉じられます。
            </div>
          ) : null}

          <button
            onClick={() =>
              signIn(
                "google",
                {
                  callbackUrl: fromExtension ? "/signin?from=extension" : "/",
                },
                { prompt: "select_account" },
              )
            }
            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Googleでサインイン
          </button>

          <p className="mt-8 text-center text-sm leading-8 text-gray-500">
            サインインすることで、
            <br />
            利用規約とプライバシーポリシーに同意したものとみなされます
          </p>
        </div>
      </div>
    </div>
  );
}

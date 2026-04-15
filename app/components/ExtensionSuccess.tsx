
"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function ExtensionSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 font-sans">
      <div className="w-full max-w-xl rounded-2xl bg-white px-8 py-12 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
          <span className="text-3xl text-white">✓</span>
        </div>
        <h2 className="mb-4 text-4xl font-semibold text-green-400">
          ログイン完了！
        </h2>
        <p className="mb-8 text-2xl leading-relaxed text-gray-600">
          拡張機能で記事の保存ができるようになりました！
          <br />
          このタブを閉じて、保存したいページで拡張機能をクリックしてください。
        </p>

        <Link
          href="/"
          className="inline-block rounded-xl bg-gray-500 px-10 py-4 text-xl text-white no-underline transition-colors hover:bg-gray-600"
        >
          アプリを開く
        </Link>
      </div>
    </div>
  );
}
            
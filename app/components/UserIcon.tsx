"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function UserIcon() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const userEmail = session?.user?.email ?? "";
  const userName =
    status === "authenticated"
      ? (session?.user?.name?.trim() ||
          userEmail.split("@")[0] ||
          "ユーザー")
      : status === "loading"
        ? "…"
        : "ユーザー";
  const userImage = session?.user?.image ?? "/images/userIcon.png";

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/signin" });
  };

  if (status === "loading") {
    return (
      <div className="hidden lg:flex relative h-11/12 aspect-square items-center">
        <div className="relative h-10 md:h-14 w-10 md:w-14 rounded-full overflow-hidden border-2 border-gray-300 opacity-70">
          <Image
            className="object-cover"
            src="/images/userIcon.png"
            fill={true}
            alt="ユーザーアイコン画像"
            sizes="80px"
          />
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="hidden lg:flex items-center">
        <Link
          href="/signin"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          サインイン
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex relative h-11/12 aspect-square items-center">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative h-10 md:h-14 w-10 md:w-14 rounded-full overflow-hidden border-2 border-gray-300 hover:border-gray-400 transition-colors"
      >
        <Image
          className="object-cover"
          src={userImage}
          fill={true}
          alt="ユーザーアイコン画像"
          sizes="80px"
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isMenuOpen && (
        <div className="absolute right-0 top-5 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            ログアウト
          </button>
        </div>
      )}

      {/* メニューを閉じるためのオーバーレイ */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default UserIcon;

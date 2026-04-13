"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { initialArticleInputState } from "../actions/articles/article-input-state";
import { handleArticleInput } from "../actions/articles/handle-input";
import FormMessage from "./FormMessage";
import { urlRegistrationSchema } from "@/lib/validations/urlRegistrationSchema";
import { searchKeywordRegistrationSchema } from "@/lib/validations/searchKeywordRegistrationSchema";
import ToggleSwitch from "./ToggleSwitch";

function InputFormGroup() {
  const [state, formAction, isPending] = useActionState(
    handleArticleInput,
    initialArticleInputState
  );
  const [displayFeedback, setDisplayFeedback] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isUrlMode, setIsUrlMode] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nextFeedback =
      state.error != null
        ? { message: state.error, variant: "error" as const }
        : state.success != null
          ? { message: state.success, variant: "success" as const }
          : null;

    if (!nextFeedback) {
      return;
    }

    setDisplayFeedback(nextFeedback);
    const timerId = window.setTimeout(() => {
      setDisplayFeedback(null);
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [state.error, state.success]);

  useEffect(() => {
    if (!clientError) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setClientError(null);
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [clientError]);

  useEffect(() => {
    const queryFromUrl = searchParams.get("q") ?? "";
    setKeyword(queryFromUrl);
  }, [searchParams]);

  const validateUrl = (value: string) => {
    const result = urlRegistrationSchema.safeParse({ url: value });
    if (!result.success) {
      return result.error.issues[0]?.message ?? "入力内容を確認してください";
    }
    return null;
  };

  const validateKeyword = (value: string) => {
    const result = searchKeywordRegistrationSchema.safeParse({ keyword: value });
    if (!result.success) {
      return result.error.issues[0]?.message ?? "入力内容を確認してください";
    }
    return null;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (clientError) {
      setClientError(validateUrl(value));
    }
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (clientError) {
      setClientError(validateKeyword(value));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isUrlMode) {
      const error = validateKeyword(keyword);
      setClientError(error);
      if (error) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const query = keyword.trim();
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      if (query) {
        nextSearchParams.set("q", query);
      } else {
        nextSearchParams.delete("q");
      }
      router.push(
        `${pathname}${nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : ""}`
      );
      return;
    }

    const error = validateUrl(url);
    setClientError(error);
    if (error) {
      event.preventDefault();
    }
  };

  return (
    <div className="flex gap-3 w-3/5 items-center relative">
      <div className="flex gap-3 items-center w-full">
        <ToggleSwitch
          checked={isUrlMode}
          onChange={(nextValue) => {
            setIsUrlMode(nextValue);
            setClientError(null);
          }}
          className="shrink-0"
        />
        {/* インプットフォーム */}
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="flex gap-3 flex-1"
        >
          <input
            type="text"
            name={isUrlMode ? "url" : "query"}
            placeholder={
              isUrlMode ? "例：https://example.com/article" : "タイトルやサイト名で検索"
            }
            value={isUrlMode ? url : keyword}
            onChange={(event) =>
              isUrlMode
                ? handleUrlChange(event.target.value)
                : handleKeywordChange(event.target.value)
            }
            onBlur={(event) =>
              setClientError(
                isUrlMode
                  ? validateUrl(event.target.value)
                  : validateKeyword(event.target.value)
              )
            }
            disabled={isUrlMode && isPending}
            aria-invalid={clientError ? "true" : "false"}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              clientError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          <button
            type="submit"
            disabled={isUrlMode && isPending}
            className="hidden md:block w-28 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUrlMode ? (isPending ? "処理中…" : "登録") : "検索"}
          </button>
        </form>
      </div>
      {clientError ? (
        <FormMessage message={clientError} variant="error" />
      ) : null}
      {displayFeedback ? (
        <FormMessage
          message={displayFeedback.message}
          variant={displayFeedback.variant}
        />
      ) : null}
    </div>
  );
}

export default InputFormGroup;

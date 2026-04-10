import { z } from "zod";

export const urlRegistrationSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URLを入力してください")
    .max(255, "URLは255文字以内で入力してください")
    .url("正しいURL形式で入力してください")
    .refine((val) => {
      try {
        const parsedUrl = new URL(val);
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
      } catch {
        return false;
      }
    }, {
      message: "正しいURL形式で入力してください",
    }),
});

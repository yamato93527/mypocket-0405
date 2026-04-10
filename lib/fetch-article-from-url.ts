import { JSDOM } from "jsdom";
import http from "node:http";
import https from "node:https";

export type FetchedArticleData = {
  title: string;
  siteName: string;
  description: string;
  siteUpdatedAt: string;
  thumbnail: string;
  url: string;
  content: string;
};

type HtmlResponse = {
  html: string;
  url: string;
  ok: boolean;
};

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "accept-language": "ja,en-US;q=0.9,en;q=0.8",
};

async function fetchHtml(
  inputUrl: string,
  redirectCount = 0
): Promise<HtmlResponse | null> {
  if (redirectCount > 5) {
    return null;
  }

  const targetUrl = new URL(inputUrl);
  const client = targetUrl.protocol === "https:" ? https : http;
  const allowSelfSignedTls = process.env.NODE_ENV !== "production";

  return new Promise((resolve) => {
    const request = client.get(
      targetUrl,
      {
        headers: REQUEST_HEADERS,
        rejectUnauthorized: allowSelfSignedTls ? false : undefined,
      },
      (response) => {
        const location = response.headers.location;
        const statusCode = response.statusCode ?? 0;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          typeof location === "string"
        ) {
          response.resume();
          const nextUrl = new URL(location, targetUrl).toString();
          void fetchHtml(nextUrl, redirectCount + 1).then(resolve);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          resolve(null);
          return;
        }

        response.setEncoding("utf8");
        let html = "";

        response.on("data", (chunk) => {
          html += chunk;
        });

        response.on("end", () => {
          resolve({
            html,
            url: targetUrl.toString(),
            ok: true,
          });
        });
      }
    );

    request.on("error", () => resolve(null));
    request.end();
  });
}

export async function fetchArticleFromUrl(
  inputUrl: string
): Promise<FetchedArticleData | null> {
  const url = inputUrl.trim();
  if (!url) {
    return null;
  }

  try {
    new URL(url);
  } catch {
    return null;
  }

  try {
    const response = await fetchHtml(url);

    if (!response?.ok) {
      return null;
    }

    const dom = new JSDOM(response.html);
    const { document } = dom.window;
    const pageUrl = new URL(response.url || url);

    const getMetaContent = (...selectors: string[]) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        const content = element?.getAttribute("content")?.trim();
        if (content) {
          return content;
        }
      }
      return "";
    };

    const getTextContent = (...selectors: string[]) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        const text = element?.textContent?.trim();
        if (text) {
          return text;
        }
      }
      return "";
    };

    const normalizeText = (value: string) =>
      value.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

    const resolveAssetUrl = (value: string) => {
      if (!value) {
        return "";
      }

      try {
        return new URL(value, pageUrl).toString();
      } catch {
        return value;
      }
    };

    const getPublishedDate = () => {
      const rawDate =
        getMetaContent(
          'meta[property="article:modified_time"]',
          'meta[property="og:updated_time"]',
          'meta[name="parsely-pub-date"]',
          'meta[property="article:published_time"]',
          'meta[name="pubdate"]',
          'meta[name="date"]'
        ) ||
        document.querySelector("time")?.getAttribute("datetime") ||
        "";

      const parsedDate = rawDate ? new Date(rawDate) : null;
      if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }

      return new Date().toISOString();
    };

    const contentRoot =
      document.querySelector("article") ??
      document.querySelector("main") ??
      document.body;

    const content = normalizeText(contentRoot?.textContent ?? "");

    return {
      title: normalizeText(
        getMetaContent(
          'meta[property="og:title"]',
          'meta[name="twitter:title"]'
        ) ||
          getTextContent("title", "h1") ||
          pageUrl.hostname
      ),
      siteName: normalizeText(
        getMetaContent(
          'meta[property="og:site_name"]',
          'meta[name="application-name"]'
        ) || pageUrl.hostname.replace(/^www\./, "")
      ),
      description: normalizeText(
        getMetaContent(
          'meta[name="description"]',
          'meta[property="og:description"]',
          'meta[name="twitter:description"]'
        )
      ),
      siteUpdatedAt: getPublishedDate(),
      thumbnail: resolveAssetUrl(
        getMetaContent(
          'meta[property="og:image"]',
          'meta[name="twitter:image"]'
        ) || document.querySelector("img")?.getAttribute("src")?.trim() || ""
      ),
      url: pageUrl.toString(),
      content,
    };
  } catch {
    return null;
  }
}

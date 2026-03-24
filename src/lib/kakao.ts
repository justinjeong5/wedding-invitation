declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

let initialized = false;

export function loadKakaoSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    if (window.Kakao) {
      initKakao();
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.integrity = "sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nk";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      initKakao();
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initKakao() {
  const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  if (!initialized && key && window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(key);
    initialized = true;
  }
}

export function shareKakao({
  title,
  description,
  imageUrl,
  webUrl,
}: {
  title: string;
  description: string;
  imageUrl: string;
  webUrl: string;
}) {
  if (!window.Kakao?.isInitialized()) return;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: webUrl, webUrl },
    },
    buttons: [
      {
        title: "청첩장 보기",
        link: { mobileWebUrl: webUrl, webUrl },
      },
    ],
  });
}

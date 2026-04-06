export async function copyToClipboard(
  text: string,
  toastMessage?: string,
): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (toastMessage) {
      window.dispatchEvent(
        new CustomEvent("app-toast", { detail: toastMessage }),
      );
    }
    return true;
  } catch {
    return false;
  }
}

"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { uploadGuestPhoto } from "@/features/guest-gallery/actions";
import { validateImage, validateAspectRatio, resizeImage } from "@/features/guest-gallery/image-resize";
import { useVisitorId } from "@/components/VisitTracker";

export default function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const visitorId = useVisitorId();
  const [preview, setPreview] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resizedFileRef = useRef<File | null>(null);

  const handleSubmit = async (
    _prevState: { success: boolean; error?: string },
    formData: FormData
  ) => {
    if (resizedFileRef.current) {
      formData.set("image", resizedFileRef.current);
    }
    const result = await uploadGuestPhoto(_prevState, formData);
    if (result.success) {
      if (preview) URL.revokeObjectURL(preview);
      formRef.current?.reset();
      setPreview(null);
      resizedFileRef.current = null;
      onUploaded();
    }
    return result;
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, {
    success: false,
  });

  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setFileError(error);
      setPreview(null);
      resizedFileRef.current = null;
      e.target.value = "";
      return;
    }

    setFileError(null);
    if (preview) URL.revokeObjectURL(preview);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setResizing(true);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new window.Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = previewUrl;
      });
      const ratioError = validateAspectRatio(img.naturalWidth, img.naturalHeight);
      if (ratioError) {
        setFileError(ratioError);
        URL.revokeObjectURL(previewUrl);
        setPreview(null);
        resizedFileRef.current = null;
        e.target.value = "";
        setResizing(false);
        return;
      }
      resizedFileRef.current = await resizeImage(file);
    } catch {
      resizedFileRef.current = file;
    }
    setResizing(false);
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-3 mb-6" data-1p-ignore>
      <input type="hidden" name="visitor_id" value={visitorId} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border rounded-xl overflow-hidden transition-colors hover:border-primary/40"
        style={{ minHeight: "auto" }}
      >
        {preview ? (
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={preview}
              alt="미리보기"
              fill
              className="object-cover"
              sizes="480px"
              unoptimized
            />
            {(resizing || isPending) && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <p className="text-white text-xs">
                  {resizing ? "사진 변환 중..." : "업로드 중..."}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 mx-auto mb-2 text-text-muted/50"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <p className="text-xs text-text-muted">사진을 선택해주세요</p>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileChange}
      />
      {fileError && (
        <p className="text-red-500 text-xs" role="alert">{fileError}</p>
      )}

      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="이름"
          required
          className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          autoComplete="off"
          placeholder="비밀번호"
          required
          className="w-24 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
        />
      </div>
      <p className="text-[10px] text-text-muted/60 -mt-1">
        비밀번호는 사진 삭제 시 본인 확인에 사용됩니다.
      </p>

      <div className="relative">
        <input
          name="caption"
          type="text"
          placeholder="한 마디 남기기 (선택)"
          maxLength={50}
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted pointer-events-none">
          / 50
        </span>
      </div>

      {state.error && (
        <p className="text-red-500 text-xs" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || resizing || !preview}
        className="w-full py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {isPending ? "올리는 중..." : "사진 올리기"}
      </button>
    </form>
  );
}

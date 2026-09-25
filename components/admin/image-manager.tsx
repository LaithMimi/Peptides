"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  addProductImage,
  removeProductImage,
  reorderProductImages,
} from "@/app/admin/actions/products";
import { adminGhostButton, adminInput, errorMessage } from "@/components/admin/admin-form";

interface Img {
  id: string;
  url: string;
}

/**
 * Upload, reorder and remove a product's images. The first image is the one
 * shown on product cards. Files go straight to Vercel Blob (5 MB, JPEG/PNG/WebP);
 * an existing file under /public can also be added by path.
 */
export function ImageManager({ productId, images }: { productId: string; images: Img[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState("");

  function run(task: () => Promise<{ ok: boolean; code?: string; fieldErrors?: Record<string, string> } | void>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (result && !result.ok) {
          setMessage(errorMessage(result.fieldErrors?.url ?? result.code) ?? "Failed.");
          return;
        }
        router.refresh();
      } catch {
        setMessage("Upload failed. Check the file (JPEG, PNG or WebP, up to 5 MB) and that image storage is configured.");
      }
    });
  }

  function move(index: number, delta: number) {
    const ids = images.map((i) => i.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderProductImages(productId, ids));
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length === 0 ? (
        <p className="text-sm text-muted">No images yet. Products without an image show a placeholder.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="flex flex-col gap-2 rounded-lg border border-border-strong p-2">
              <div className="relative aspect-square overflow-hidden rounded bg-surface-raised">
                <Image src={image.url} alt="" fill sizes="10rem" className="object-cover" />
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                {index === 0 ? "Main image" : `Image ${index + 1}`}
              </p>
              <div className="flex flex-wrap gap-1">
                <button type="button" disabled={pending || index === 0} onClick={() => move(index, -1)} className={adminGhostButton} aria-label={`Move image ${index + 1} earlier`}>
                  ←
                </button>
                <button type="button" disabled={pending || index === images.length - 1} onClick={() => move(index, 1)} className={adminGhostButton} aria-label={`Move image ${index + 1} later`}>
                  →
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className={adminGhostButton}
                  onClick={() => {
                    if (window.confirm("Remove this image?")) run(() => removeProductImage(image.id));
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-border-strong p-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">Upload image</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            className={adminInput}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              run(async () => {
                const blob = await upload(file.name, file, {
                  access: "public",
                  handleUploadUrl: "/api/admin/blob-upload",
                });
                if (fileRef.current) fileRef.current.value = "";
                return addProductImage(productId, blob.url);
              });
            }}
          />
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
              Or add a file already in /public
            </span>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/products/name.jpeg"
              className={adminInput}
            />
          </label>
          <button
            type="button"
            disabled={pending || !path.trim()}
            className={adminGhostButton}
            onClick={() => {
              const value = path.trim();
              run(async () => {
                const result = await addProductImage(productId, value);
                if (result.ok) setPath("");
                return result;
              });
            }}
          >
            Add
          </button>
        </div>
        {message && (
          <p role="alert" className="text-sm text-danger">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

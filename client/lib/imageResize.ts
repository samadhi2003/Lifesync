/**
 * Resize a user-selected image into a small base64 data URL suitable for
 * inline storage in a Firestore document.
 *
 * Profile avatars are tiny (a few hundred px max), so we render the image
 * onto a canvas at `maxSize` along its longest edge and re-encode as JPEG.
 * A 256px / 0.85-quality JPEG of a typical phone photo lands around 25–40 KB,
 * well under the ~1 MB Firestore document cap.
 */

export async function resizeImageToDataUrl(
    file: File,
    maxSize = 256,
    quality = 0.85,
): Promise<string> {
    if (typeof window === "undefined") {
        throw new Error("resizeImageToDataUrl must run in the browser.");
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Selected file is not an image.");
    }

    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(dataUrl);

    const { width, height } = fitWithin(img.width, img.height, maxSize);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context.");
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to decode image."));
        img.src = src;
    });
}

function fitWithin(srcW: number, srcH: number, maxSize: number): { width: number; height: number } {
    if (srcW <= maxSize && srcH <= maxSize) return { width: srcW, height: srcH };
    const ratio = srcW / srcH;
    return ratio >= 1
        ? { width: maxSize, height: Math.round(maxSize / ratio) }
        : { width: Math.round(maxSize * ratio), height: maxSize };
}

import movieKnife from "@/assets/movie-knife.jpg";
import fixingKnife from "@/assets/fixing-knife.jpg";
import upperLooper from "@/assets/upper-looper.jpg";
import lowerLooper from "@/assets/lower-looper.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "movie-knife": movieKnife,
  "fixing-knife": fixingKnife,
  "upper-looper": upperLooper,
  "lower-looper": lowerLooper,
};

export const IMAGE_OPTIONS = Object.keys(PRODUCT_IMAGES);

export function productImage(key: string) {
  return PRODUCT_IMAGES[key] ?? movieKnife;
}
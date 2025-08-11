// src/lib/getHotelImageUrl.ts
type AnyObj = Record<string, any>;

export default function getHotelImageUrl(hotelData: AnyObj | null | undefined) {
  if (!hotelData) return null;

  // 1) If backend ever sends a ready-made image, use it.
  if (typeof hotelData.image === "string" && hotelData.image.length > 0) {
    return hotelData.image;
  }

  // 2) Loyalty API style: image_details.prefix/suffix
  const prefix = hotelData?.image_details?.prefix;
  const suffix = hotelData?.image_details?.suffix;
  if (prefix && suffix) {
    // Many sizes exist (1–x). 1 is safe/small; change if you need higher res.
    return `${prefix}1${suffix}`;
  }

  // 3) Other common shapes you might meet
  if (hotelData?.thumbnail) return hotelData.thumbnail;
  if (hotelData?.photo) return hotelData.photo;

  const firstPhotoUrl = hotelData?.photos?.[0]?.url;
  if (firstPhotoUrl) return firstPhotoUrl;

  const firstImageString = Array.isArray(hotelData?.images) && typeof hotelData.images[0] === "string"
    ? hotelData.images[0]
    : null;
  if (firstImageString) return firstImageString;

  const firstImageUrl = hotelData?.images?.[0]?.url;
  if (firstImageUrl) return firstImageUrl;

  return null;
}

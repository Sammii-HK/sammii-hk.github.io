/**
 * TODO(headshot): there is no photo of Sammii in public/ yet
 * (public/assets/images/sammii.png is the wordmark, not a portrait). When a
 * headshot is added, render it here with next/image and give it real alt
 * text, so organisers can take it straight from this page.
 *
 * Until then the slot renders nothing in production, and a marked
 * placeholder in development so the gap stays visible while working.
 */
export function HeadshotSlot() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="speaking-headshot-todo" role="note">
      TODO: headshot. Add a photo to public/ and render it in app/speaking/HeadshotSlot.tsx. Hidden in production.
    </div>
  );
}

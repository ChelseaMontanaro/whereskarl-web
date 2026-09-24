type PhoneFrameProps = {
  src: string;
  alt: string;
  className?: string;
  /**
   * Uniform scale of the screenshot inside the existing screen clip.
   * The frame's layout size does not change. Values above 1 cover a
   * non-content source edge without resizing the phone.
   */
  screenScale?: number;
};

/**
 * CSS bezel only. The image is an owner-provided screenshot and is not redrawn.
 */
export function PhoneFrame({
  src,
  alt,
  className = "",
  screenScale,
}: PhoneFrameProps) {
  const scaled = screenScale != null && screenScale > 1;

  return (
    <div
      className={`rounded-[1.7rem] bg-[#111214] p-[0.4rem] shadow-[0_22px_44px_rgba(16,35,64,0.28)] ${className}`}
    >
      {scaled ? (
        <div className="overflow-hidden rounded-[1.35rem]">
          <img
            src={src}
            alt={alt}
            className="block w-full origin-left"
            style={{ transform: `scale(${screenScale})` }}
          />
        </div>
      ) : (
        <img src={src} alt={alt} className="block w-full rounded-[1.35rem]" />
      )}
    </div>
  );
}

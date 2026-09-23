type PhoneFrameProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * CSS bezel only. The image is an owner-provided screenshot and is not redrawn.
 */
export function PhoneFrame({ src, alt, className = "" }: PhoneFrameProps) {
  return (
    <div
      className={`rounded-[1.7rem] bg-[#111214] p-[0.4rem] shadow-[0_22px_44px_rgba(16,35,64,0.28)] ${className}`}
    >
      <img src={src} alt={alt} className="block w-full rounded-[1.35rem]" />
    </div>
  );
}

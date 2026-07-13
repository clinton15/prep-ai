/**
 * Skip link for keyboard users. Visually hidden until focused.
 */
export default function SkipToContent({
    href = "#main-content",
}: {
    href?: string;
}) {
    return (
        <a href={href} className="skip-to-content">
            Skip to main content
        </a>
    );
}

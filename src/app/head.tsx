export default function Head() {
  return (
    <>
      {/* Allow content to extend into device safe areas (iOS home indicator/notch) */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      {/* Optional: prefer-theme-color for mobile address bar color */}
      <meta name="theme-color" content="#000000" />
    </>
  );
}

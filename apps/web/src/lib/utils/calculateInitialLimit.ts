function calculateInitialLimit() {
  if (typeof window === 'undefined') {
    return 10;
  }
  const viewportHeight = window.innerHeight;

  if (viewportHeight < 600) return 8;
  if (viewportHeight < 900) return 12;
  if (viewportHeight < 1200) return 16;
  return 20;
}

export default calculateInitialLimit;

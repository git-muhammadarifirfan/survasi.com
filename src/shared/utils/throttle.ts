/**
 * @module shared/utils/throttle
 * @description Helper throttling untuk membatasi eksekusi fungsi per interval milidetik
 */

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number = 2000
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
      return lastResult;
    } else {
      // Trigger global event if user clicks too fast
      window.dispatchEvent(
        new CustomEvent('bsan_rate_limit_exceeded', {
          detail: {
            message: 'Aksi terlalu cepat! Mohon tunggu 2 detik sebelum menekan tombol lagi.',
          },
        })
      );
      return undefined;
    }
  };
}

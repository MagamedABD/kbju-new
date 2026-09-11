/** Простой конкатенатор классов: отбрасывает falsy-значения. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

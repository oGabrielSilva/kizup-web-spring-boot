import { CSS_CLASS_SHAKE_ANIM } from '../constants/css';

export class AnimTool {
  public shake(el: HTMLElement, focus = true, time = 500) {
    if (el.classList.contains(CSS_CLASS_SHAKE_ANIM)) el.classList.remove(CSS_CLASS_SHAKE_ANIM);
    el.classList.add(CSS_CLASS_SHAKE_ANIM);
    if (focus && typeof el.focus === 'function') el.focus();
    setTimeout(() => el.classList.remove(CSS_CLASS_SHAKE_ANIM), time);
  }

  /**
   *
   * @deprecated
   * @description Todas as tools devem ser instanciadas. Não são mais utilizados métodos static.
   */
  public static shake(el: HTMLElement, focus = true, time = 500) {
    if (el.classList.contains(CSS_CLASS_SHAKE_ANIM)) el.classList.remove(CSS_CLASS_SHAKE_ANIM);
    el.classList.add(CSS_CLASS_SHAKE_ANIM);
    if (focus && typeof el.focus === 'function') el.focus();
    setTimeout(() => el.classList.remove(CSS_CLASS_SHAKE_ANIM), time);
  }
}

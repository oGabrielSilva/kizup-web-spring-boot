import { WWWROOT } from './html';

const getDefaultTransitionTime = () => {
  const time = WWWROOT.dataset.defaultTransition;
  if (!time || isNaN(Number(time))) {
    console.error('WWWROOT is not defining the default CSS transition data');
    return 400;
  }
  return Number(time);
};

export const CSS_CLASS_INPUT_DANGER = 'input-danger';
export const CSS_CLASS_SHAKE_ANIM = 'element-animated-by-shake';
export const CSS_DEFAULT_TRANSITION_TIME = getDefaultTransitionTime();

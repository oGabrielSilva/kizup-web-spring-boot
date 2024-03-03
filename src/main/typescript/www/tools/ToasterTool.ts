import { CSS_DEFAULT_TRANSITION_TIME } from '../constants/css';
import { WWWROOT } from '../constants/html';

const id = {
  container: 'toaster-container',
  containerActive: 'toaster-container-active',
  header: 'toaster-header',
  headerPart: 'toaster-header-part',
  message: 'toaster-message',
};
const headerBaseIcons = {
  success: 'bi-check2-circle',
  info: 'bi-info-circle',
  danger: 'bi-exclamation-diamond',
  warn: 'bi-question-diamond',
};

export class ToasterTool {
  private static DEFAULT_TIMER = 6000;

  private static readonly stack: Array<{
    message: string;
    timer: number;
    type: 'success' | 'danger' | 'warn' | 'info';
    onDestroy: () => void;
  }> = [];

  public success(
    messageTxt: string = ':)',
    onDestroy?: () => void,
    timer = ToasterTool.DEFAULT_TIMER
  ) {
    if (document.getElementById(id.container)) {
      this.toStack(messageTxt, timer, onDestroy, 'success');
      return;
    }

    const { container, containerActive, message, headerIcon } = this.generateBase(
      messageTxt,
      'success',
      timer,
      onDestroy
    );
    container.style.background = 'var(--success)';
    message.style.color = 'var(--textWarn)';
    message.style.fontWeight = '500';
    headerIcon.style.color = 'var(--textWarn)';
    containerActive.style.borderColor = 'var(--textSecondary)';

    this.toWWWROOT(container);
    return;
  }

  public info(messageTxt: string, onDestroy?: () => void, timer = ToasterTool.DEFAULT_TIMER) {
    if (document.getElementById(id.container)) {
      this.toStack(messageTxt, timer, onDestroy, 'info');
      return;
    }

    const { container } = this.generateBase(messageTxt, 'info', timer, onDestroy);

    this.toWWWROOT(container);
    return;
  }

  public warn(
    messageTxt: string = 'Oopsss...',
    onDestroy?: () => void,
    timer = ToasterTool.DEFAULT_TIMER
  ) {
    if (document.getElementById(id.container)) {
      this.toStack(messageTxt, timer, onDestroy, 'warn');
      return;
    }

    const { container, containerActive, message, headerIcon } = this.generateBase(
      messageTxt,
      'warn',
      timer,
      onDestroy
    );
    container.style.background = 'var(--warn)';
    message.style.color = 'var(--textWarn)';
    message.style.fontWeight = '500';
    headerIcon.style.color = 'var(--textWarn)';
    containerActive.style.borderColor = 'var(--textSecondary)';

    this.toWWWROOT(container);
    return;
  }

  public danger(
    messageTxt: string = 'Oopsss...',
    onDestroy?: () => void,
    timer = ToasterTool.DEFAULT_TIMER
  ) {
    if (document.getElementById(id.container)) {
      this.toStack(messageTxt, timer, onDestroy, 'danger');
      return;
    }

    const { container, containerActive } = this.generateBase(
      messageTxt,
      'danger',
      timer,
      onDestroy
    );
    container.style.background = 'var(--danger)';
    containerActive.style.borderColor = 'var(--textSecondary)';

    this.toWWWROOT(container);
    return;
  }

  private toStack(
    message: string,
    timer: number,
    onDestroy: () => void,
    type: 'success' | 'danger' | 'warn' | 'info'
  ) {
    ToasterTool.stack.push({ message, timer, type, onDestroy });
    setTimeout(() => document.getElementById(id.container).click(), 10);
  }

  private toWWWROOT(container: HTMLElement) {
    WWWROOT.appendChild(container);

    setTimeout(() => {
      container.style.transform = 'scale(1.05)';
      setTimeout(() => (container.style.transform = ''), CSS_DEFAULT_TRANSITION_TIME);
    }, 100);
  }

  private generateBase(
    messageTxt: string,
    icon: 'success' | 'info' | 'danger' | 'warn',
    timer: number,
    onDestroy?: () => void
  ) {
    const container = document.createElement('div');
    const containerActive = document.createElement('div');
    const header = document.createElement('header');
    const headerPart = document.createElement('div');
    const message = document.createElement('p');
    const headerIcon = document.createElement('i');

    container.id = id.container;
    containerActive.id = id.containerActive;
    header.id = id.header;
    headerPart.id = id.headerPart;
    message.id = id.message;
    headerIcon.classList.add('bi', headerBaseIcons[icon]);

    container.style.transform = 'scale(0)';
    container.style.transition = `all ${CSS_DEFAULT_TRANSITION_TIME - 100}ms ease-in-out`;

    message.textContent = !!messageTxt ? messageTxt : '';

    headerPart.append(headerIcon, message);
    header.append(headerPart);

    const style = document.createElement('style');

    style.innerHTML = `
      .class-anim-toaster-container-active {
        animation: anim-toaster-container-active ${timer}ms ease-out;
      }

      @keyframes anim-toaster-container-active {
        to {
          transform: translateX(-100%);
        }
      }
    `;
    containerActive.classList.add('class-anim-toaster-container-active');
    document.head.appendChild(style);

    container.append(containerActive, header);

    const doc = this;

    const destroy = () => {
      style.remove();
      container.style.transform = 'scale(0)';
      setTimeout(() => {
        container.remove();
        if (onDestroy && typeof onDestroy === 'function') onDestroy();
        if (ToasterTool.stack.length > 0) {
          const { type, ...next } = ToasterTool.stack.shift();
          doc[type](next.message, next.onDestroy, next.timer);
        }
      }, CSS_DEFAULT_TRANSITION_TIME - 150);
    };

    const timeout = setTimeout(() => destroy(), timer);
    const timeoutToActive = setTimeout(() => {
      containerActive.remove();
    }, timer - 100);
    container.addEventListener('click', () => {
      clearTimeout(timeout);
      clearTimeout(timeoutToActive);
      destroy();
    });

    return { container, containerActive, header, headerIcon, message, destroy };
  }
}

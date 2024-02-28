import { WWWROOT } from '../constants/html';

export class ProgressIndicatorTool {
  private readonly className = {
    container: 'progress-indicator-container',
    background: 'progress-indicator-background',
    indicator: 'progress-indicator',
    indicator2: 'progress-indicator-2',
  };

  private indicator: HTMLDivElement = null;

  public generate() {
    if (!this.indicator) {
      const container = document.createElement('div');
      const background = document.createElement('div');
      const progressIndicator = document.createElement('div');
      const progressIndicator2 = document.createElement('div');
      container.classList.add(this.className.container);
      background.classList.add(this.className.background);
      progressIndicator.classList.add(this.className.indicator);
      progressIndicator2.classList.add(this.className.indicator2);

      background.append(progressIndicator, progressIndicator2);
      container.appendChild(background);
      this.indicator = container;
    }
  }

  public generateAndShow() {
    this.generate();
    this.show();
  }

  public show() {
    if (this.indicator) {
      WWWROOT.appendChild(this.indicator);
    }
  }

  public hidden() {
    if (this.indicator) {
      setTimeout(() => this.indicator.remove(), 400);
    }
  }

  /**
   * @description
   * pt-BR: A função `destroyInstance` remove a instância do HTML e torna o atributo nulo. Isso implica na eliminação completa do indicador. Assim, ao ser recriado, uma nova instância será gerada. Isso difere do método `hidden`, que apenas remove o elemento do HTML, mantendo a instância intacta.
   *
   * en: The `destroyInstance` function removes the HTML instance and sets the attribute to null. This implies the complete elimination of the indicator. Thus, upon recreation, a new instance will be generated. This differs from the `hidden` method, which only removes the HTML element, keeping the instance intact.
   */
  public destroyInstance() {
    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
  }
}

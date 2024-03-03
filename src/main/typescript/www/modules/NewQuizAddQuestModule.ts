import { CSS_DEFAULT_TRANSITION_TIME } from '../constants/css';
import { AnimTool } from '../tools/AnimTool';
import { ImageTool } from '../tools/ImageTool';
import { ProgressIndicatorTool } from '../tools/ProgressIndicatorTool';
import { ToasterTool } from '../tools/ToasterTool';
import { NewQuizFormValidation } from '../validation/NewQuizFormValidation';
import { IQuest } from './NewQuizFormModule';

export interface IAlternative {
  id: number;
  content: string;
  isCorrect: boolean;
  input: HTMLInputElement;
}

export interface IAlternativeInputConfig {
  placeholder: string;
  dataError: string;
  ariaLabel: string;
  prefix: string;
  className: string;
  namePrefix: string;
  classToAlternativeCorrect: string;
  classToAlternativeIncorrect: string;
  alternativeEqualErrorMessage: string;
}

export class NewQuizAddQuestModule {
  private container: HTMLElement;
  private cancelButton: HTMLButtonElement;
  private HTMLImage: HTMLImageElement;
  private defaultHTMLImageSRC: string;
  private HTMLImageInput: HTMLInputElement;
  private HTMLImageBlob: Blob;
  private titleInput: HTMLInputElement;
  private alternatives: IAlternative[];
  private alternativesContainer: HTMLUListElement;
  private addAlternativeButton: HTMLButtonElement;
  private defaultAlternativeInputConfig: IAlternativeInputConfig;
  private maxAlternativeInfo: string;
  private selectCorrectAlternative: HTMLSelectElement;
  private addButton: HTMLButtonElement;
  private selectQuestTime: HTMLSelectElement;
  private questAddedMessage: string;

  constructor(
    form: HTMLFormElement,
    private readonly pushQuest: (quest: IQuest) => void,
    private readonly toaster: ToasterTool,
    private readonly imageTool: ImageTool,
    private readonly validation: NewQuizFormValidation,
    private readonly progress: ProgressIndicatorTool,
    private readonly anim: AnimTool
  ) {
    this.container = form.querySelector('.add-quest-container') as HTMLElement;
    const alternativeInput1 = this.container.querySelector(
      'input#alternative-1'
    ) as HTMLInputElement;
    this.selectCorrectAlternative = this.container.querySelector(
      'select#alternative-correct'
    ) as HTMLSelectElement;
    this.questAddedMessage = this.container.dataset.added;
    this.cancelButton = this.container.querySelector('button#quest-cancel') as HTMLButtonElement;
    this.HTMLImage = this.container.querySelector('img[role="button"]');
    this.defaultHTMLImageSRC = '';
    this.HTMLImageInput = this.container.querySelector('input#quest-img-input');
    this.HTMLImageBlob = null;
    this.titleInput = this.container.querySelector('input#quest-title');
    this.addAlternativeButton = this.container.querySelector('button#add-alternative');
    this.alternatives = [
      {
        id: 1,
        content: '',
        isCorrect: true,
        input: alternativeInput1,
      },
      {
        id: 2,
        content: '',
        isCorrect: false,
        input: this.container.querySelector('input#alternative-2'),
      },
    ];
    this.alternativesContainer = this.container.querySelector('ul.alternative-group');
    this.defaultAlternativeInputConfig = {
      ariaLabel: alternativeInput1.ariaLabel.split('1')[0],
      dataError: alternativeInput1.dataset.error,
      placeholder: alternativeInput1.placeholder.split('1')[0],
      prefix: alternativeInput1.id.split('1')[0],
      className: alternativeInput1.dataset.className,
      namePrefix: this.selectCorrectAlternative.querySelector('option').textContent.split(' ')[0],
      classToAlternativeCorrect: alternativeInput1.dataset.classCorrect,
      classToAlternativeIncorrect: alternativeInput1.dataset.classIncorrect,
      alternativeEqualErrorMessage: '',
    };
    this.maxAlternativeInfo = '';
    this.addButton = this.container.querySelector('button#quest-add');
    this.selectQuestTime = this.container.querySelector('select#quest-time');
    this.maxAlternativeInfo = this.addAlternativeButton.dataset.info;
    this.defaultAlternativeInputConfig.alternativeEqualErrorMessage =
      this.alternativesContainer.dataset.errorEqual;
    this.defaultHTMLImageSRC = this.HTMLImage.src;
  }

  public resetAddQuest() {
    const config = this;
    config.HTMLImage.src = config.defaultHTMLImageSRC;
    config.titleInput.value = '';
    config.alternatives.forEach((alt) => {
      if (alt.id > 2) {
        alt.input.parentElement.querySelector('button').click();
      }
    });
    config.alternatives = config.alternatives.filter((alt) => alt.id < 3);
    config.alternatives.forEach((alt) => {
      alt.isCorrect = alt.id === 1;
      alt.content = '';
      alt.input.value = '';
    });
    config.selectQuestTime.querySelector('option').selected = true;
    this.updateIsCorrectAlternative();
  }

  public configureAddQuest(buttonAddQuest: HTMLButtonElement) {
    const [attr, value] = this.container.dataset.off.split('.');
    buttonAddQuest.addEventListener('click', () => ((this.container.style as any)[attr] = ''));
    this.cancelButton.addEventListener(
      'click',
      () => ((this.container.style as any)[attr] = value)
    );
    this.HTMLImage.addEventListener('click', () => this.HTMLImageInput.click());
    this.HTMLImageInput.addEventListener('input', () => this.processQuestBanner());
    this.titleInput.value = '';
    this.titleInput.addEventListener('input', () => {
      if (this.validation.titleIsValid(this.titleInput.value)) {
        this.titleInput.classList.remove('input-danger');
      } else this.titleInput.classList.add('input-danger');
    });
    this.configureAddQuestInputListeners();
    this.addAlternativeButton.addEventListener('click', () => this.addAlternativeToQuest());
    this.selectCorrectAlternative.addEventListener('change', () =>
      this.updateIsCorrectAlternative()
    );
    this.addButton.addEventListener('click', () => {
      const addQuest = this;
      const isValid = this.getIfAddQuestIsValid();
      if (!isValid) return;
      const quest: IQuest = {
        banner: addQuest.HTMLImageBlob,
        time: isNaN(Number(addQuest.selectQuestTime.value))
          ? 30
          : Number(addQuest.selectQuestTime.value),
        title: addQuest.titleInput.value,
        alternatives: addQuest.alternatives.map((alt) => ({
          content: alt.content,
          id: alt.id,
          isCorrect: alt.isCorrect,
        })),
      };
      this.pushQuest(quest);
      this.resetAddQuest();
      this.toaster.success(this.questAddedMessage);
      console.log(this);
    });
  }

  private processQuestBanner() {
    const file = this.HTMLImageInput.files[0];
    if (!file) {
      this.toaster.warn();
      return;
    }
    this.progress.generateAndShow();
    this.imageTool
      .imageToBlobWhithoutResize(file)
      .then((blob) => {
        this.progress.hidden();
        if (blob) {
          if (this.HTMLImage.src.startsWith('blob')) {
            URL.revokeObjectURL(this.HTMLImage.src);
          }
          this.HTMLImage.src = URL.createObjectURL(blob);
          this.HTMLImageBlob = blob;
        }
      })
      .catch((e) => {
        this.progress.hidden();
        console.log(e);
        this.toaster.warn();
      });
  }

  private configureAddQuestInputListeners() {
    this.alternatives.forEach((alternative) => {
      alternative.content = alternative.input.value;
      alternative.input.oninput = () => {
        alternative.content = alternative.input.value;
        if (
          alternative.content.length < 1 ||
          alternative.content.length > NewQuizFormValidation.FIELD_MAX_LENGTH
        )
          alternative.input.classList.add('input-danger');
        else alternative.input.classList.remove('input-danger');
      };
    });
  }

  private addAlternativeToQuest() {
    if (this.alternatives.length >= 4) {
      this.toaster.info(this.maxAlternativeInfo);
      this.anim.shake(this.addAlternativeButton);
      return;
    }
    //<li>
    //  <div class="item">
    //    <span>1.</span>
    //    <input maxlength="100" placeholder="Alternativa 1" data-error="A alternativa não pode ficar vazia" class="alternative" type="text" id="alternative-1" aria-label="Campo para digitar a alternativa número 1">
    //  </div>
    //</li>
    const li = document.createElement('li');
    li.style.transform = 'scale(0)';
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('item');
    const id = this.alternatives[this.alternatives.length - 1].id + 1;
    const span = document.createElement('span');
    span.textContent = `${id}.`;
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = NewQuizFormValidation.FIELD_MAX_LENGTH;
    const { defaultAlternativeInputConfig: defaultConfig } = this;
    input.placeholder = defaultConfig.placeholder.concat(id.toString());
    input.dataset.error = defaultConfig.dataError;
    input.classList.add(defaultConfig.className);
    input.classList.add(defaultConfig.classToAlternativeIncorrect);
    input.id = defaultConfig.prefix.concat(id.toString());
    input.ariaLabel = defaultConfig.ariaLabel.concat(id.toString());

    const option = document.createElement('option');
    option.value = id.toString();
    option.textContent = defaultConfig.namePrefix.concat(' ', id.toString());
    this.selectCorrectAlternative.appendChild(option);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('icon-button');
    const deleteButtonIcon = document.createElement('i');
    deleteButtonIcon.setAttribute('class', 'bi bi-trash3-fill');
    deleteButton.appendChild(deleteButtonIcon);
    deleteButton.addEventListener('click', () => {
      li.style.transform = 'scale(0)';
      setTimeout(() => {
        this.alternatives = this.alternatives.filter((alt) => alt.id !== id);
        this.configureAddQuestInputListeners();
        li.remove();
        option.remove();
        if (!this.alternatives.find((alt) => alt.isCorrect)) {
          this.alternatives[0].isCorrect = true;
          this.updateIsCorrectAlternative();
        }
      }, CSS_DEFAULT_TRANSITION_TIME);
    });

    const alternative: IAlternative = { id, content: '', input, isCorrect: false };
    this.alternatives.push(alternative);
    itemContainer.append(span, input, deleteButton);
    li.appendChild(itemContainer);
    this.alternativesContainer.appendChild(li);
    this.configureAddQuestInputListeners();
    setTimeout(() => (li.style.transform = ''), 10);
  }

  private updateIsCorrectAlternative() {
    this.alternatives.forEach((alternative) => {
      if (!alternative) {
        this.toaster.warn();
        this.selectCorrectAlternative.querySelector('option').selected = true;
        return;
      }
      if (alternative.id === Number(this.selectCorrectAlternative.value)) {
        alternative.isCorrect = true;
        alternative.input.classList.add(
          this.defaultAlternativeInputConfig.classToAlternativeCorrect
        );
        alternative.input.classList.remove(
          this.defaultAlternativeInputConfig.classToAlternativeIncorrect
        );
      } else {
        alternative.isCorrect = false;
        alternative.input.classList.remove(
          this.defaultAlternativeInputConfig.classToAlternativeCorrect
        );
        alternative.input.classList.add(
          this.defaultAlternativeInputConfig.classToAlternativeIncorrect
        );
      }
    });
  }

  private getIfAddQuestIsValid() {
    if (!this.validation.titleIsValid(this.titleInput.value)) {
      this.toaster.warn(this.titleInput.dataset.error);
      this.anim.shake(this.titleInput);
      return false;
    }

    for (let i = 0; i < this.alternatives.length; i++) {
      const alt = this.alternatives[i];
      if (
        !alt.content ||
        alt.content.length < 1 ||
        alt.content.length > NewQuizFormValidation.FIELD_MAX_LENGTH
      ) {
        this.anim.shake(alt.input);
        this.toaster.warn(alt.input.dataset.error);
        return false;
      }
    }

    for (let i = 0; i < this.alternatives.length; i++) {
      const alt = this.alternatives[i];
      const equal = this.alternatives.find((a) => a.content === alt.content && a.id !== alt.id);
      if (equal) {
        this.anim.shake(alt.input);
        this.anim.shake(equal.input);
        this.toaster.danger(this.defaultAlternativeInputConfig.alternativeEqualErrorMessage);
        return false;
      }
    }

    return true;
  }
}

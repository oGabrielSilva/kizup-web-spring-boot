import { CSS_DEFAULT_TRANSITION_TIME } from '../constants/css';
import { AnimTool } from '../tools/AnimTool';
import { ImageTool } from '../tools/ImageTool';
import { ProgressIndicatorTool } from '../tools/ProgressIndicatorTool';
import { ToasterTool } from '../tools/ToasterTool';
import { NewQuizFormValidation } from '../validation/NewQuizFormValidation';
import { IAlternative, NewQuizAddQuestModule } from './NewQuizAddQuestModule';

interface IBanner {
  input: HTMLInputElement;
  HTMLImage: HTMLImageElement;
  blob: Blob;
}

export interface IQuest {
  banner: Blob | string;
  title: string;
  time: number;
  alternatives: Array<Omit<IAlternative, 'input'>>;
}

export class NewQuizFormModule implements globalThis.Module {
  private readonly toaster = new ToasterTool();
  private readonly imageTool = new ImageTool();
  private readonly validation = new NewQuizFormValidation();
  private readonly progress = new ProgressIndicatorTool();
  private readonly anim = new AnimTool();

  private readonly goBack = document.querySelector('a.link[role="button"]');
  private readonly form: HTMLFormElement;
  private readonly banner: IBanner;
  private readonly titleInput: HTMLInputElement;
  private readonly buttonAddQuest: HTMLButtonElement;
  private readonly addQuest: NewQuizAddQuestModule;

  private readonly quests: Array<IQuest> = [];

  public constructor() {
    this.form = document.getElementById('new-quiz-form') as HTMLFormElement;
    this.banner = {
      blob: null,
      HTMLImage: this.form.querySelector('img.quiz-banner') as HTMLImageElement,
      input: this.form.querySelector('input#banner-input'),
    };
    this.titleInput = this.form.querySelector('input#quiz-title') as HTMLInputElement;
    this.buttonAddQuest = this.form.querySelector('#add-quest') as HTMLButtonElement;
    this.addQuest = new NewQuizAddQuestModule(
      this.form,
      this.pushQuest,
      this.toaster,
      this.imageTool,
      this.validation,
      this.progress,
      this.anim
    );
  }

  public run(): void {
    this.setListeners();
  }

  private setListeners() {
    this.goBack.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });

    this.banner.HTMLImage.addEventListener('click', () => this.banner.input.click());

    this.banner.input.value = '';
    this.banner.input.addEventListener('input', () => this.processBanner());

    this.titleInput.value = '';
    this.titleInput.addEventListener('input', () => {
      if (this.validation.titleIsValid(this.titleInput.value)) {
        this.titleInput.classList.remove('input-danger');
      } else this.titleInput.classList.add('input-danger');
    });

    this.addQuest.configureAddQuest(this.buttonAddQuest);
  }

  private processBanner() {
    const file = this.banner.input.files[0];
    if (!file) {
      this.toaster.danger();
      return;
    }
    this.imageTool
      .imageToBlobWhithoutResize(file)
      .then((blob) => {
        if (this.banner.HTMLImage.src.startsWith('blob')) {
          URL.revokeObjectURL(this.banner.HTMLImage.src);
        }
        this.banner.blob = blob;
        this.banner.HTMLImage.src = URL.createObjectURL(blob);
      })
      .catch(() => this.toaster.warn());
  }

  private pushQuest(quest: IQuest) {
    this.quests.push(quest);
  }
}

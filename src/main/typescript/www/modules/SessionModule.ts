import { CSS_CLASS_INPUT_DANGER } from '../constants/css';
import { AnimTool } from '../tools/AnimTool';
import { ProgressIndicatorTool } from '../tools/ProgressIndicatorTool';
import { RestApiTool } from '../tools/RestApiTool';
import { ToasterTool } from '../tools/ToasterTool';
import { UserEntityValidation } from '../validation/UserEntityValidation';

export class SessionModule implements globalThis.Module {
  private readonly HTML_SESSION_TYPE = { signIn: 'SIGN_IN', signUp: 'SIGN_UP' };
  private readonly validation = new UserEntityValidation();
  private readonly anim = new AnimTool();
  private readonly api = new RestApiTool();
  private readonly toaster = new ToasterTool();
  private readonly progressIndicator = new ProgressIndicatorTool();

  private readonly buttonShowSessionForm =
    document.querySelector<HTMLButtonElement>('#show-session-form');
  private readonly buttonHiddenSessionForm = document.querySelector('#session-form-hidden');

  private readonly showSessionFormFromBody = document.querySelector<HTMLButtonElement>(
    '#container-view-call-session-form'
  );
  private readonly homeLink = document.querySelector<HTMLLinkElement>('#home-link');

  private readonly sessionFormContainer = document.querySelector<HTMLDivElement>('#session-form');
  private readonly sessionForm = this.sessionFormContainer.querySelector('form');

  private readonly sessionEmailInput =
    this.sessionForm.querySelector<HTMLInputElement>('#session-email');

  private readonly sessionPasswordInput =
    this.sessionForm.querySelector<HTMLInputElement>('#session-password');

  private readonly buttonSessionSignUp = this.sessionForm.querySelector('#sign-up');

  private readonly buttonSessionSignIn = this.sessionForm.querySelector('button[type="submit"]');

  public run(): void {
    this.setListeners();
    this.progressIndicator.generate();
    console.log(this);
  }

  private showSessionForm() {
    this.sessionFormContainer.style.left = '0';
  }

  private setListeners() {
    this.buttonShowSessionForm.addEventListener('click', () => this.showSessionForm());
    this.buttonHiddenSessionForm.addEventListener('click', () => this.hiddenSessionForm());
    if (this.showSessionFormFromBody && this.homeLink) {
      this.showSessionFormFromBody.addEventListener('click', () => this.showSessionForm());
      this.homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
      });
    }

    this.sessionEmailInput.addEventListener('input', () => {
      if (!this.validation.emailIsValid(this.sessionEmailInput.value)) {
        this.sessionEmailInput.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.sessionEmailInput.classList.remove(CSS_CLASS_INPUT_DANGER);
    });

    this.sessionPasswordInput.addEventListener('input', () => {
      if (!this.validation.passwordIsValid(this.sessionPasswordInput.value)) {
        this.sessionPasswordInput.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.sessionPasswordInput.classList.remove(CSS_CLASS_INPUT_DANGER);
    });

    this.buttonSessionSignUp.addEventListener('click', () => {
      this.sessionForm.dataset.sessionType = this.HTML_SESSION_TYPE.signUp;
      this.sessionSubmit();
    });

    this.buttonSessionSignIn.addEventListener('click', () => {
      this.sessionForm.dataset.sessionType = this.HTML_SESSION_TYPE.signIn;
    });
    this.sessionForm.addEventListener('submit', (e) => this.sessionSubmit(e));
  }

  private hiddenSessionForm() {
    this.sessionFormContainer.style.left = '100vw';
  }

  private sessionSubmit(e?: SubmitEvent) {
    if (e) e.preventDefault();
    this.progressIndicator.show();
    const email = this.sessionEmailInput.value;
    if (!this.validation.emailIsValid(email)) {
      this.anim.shake(this.sessionEmailInput);
      this.progressIndicator.hidden();
      this.toaster.warn(this.sessionEmailInput.dataset.error);
      return;
    }
    const password = this.sessionPasswordInput.value;
    if (!this.validation.passwordIsValid(password)) {
      this.anim.shake(this.sessionPasswordInput);
      this.progressIndicator.hidden();
      this.toaster.warn(this.sessionPasswordInput.dataset.error);
      return;
    }
    const sessionType = this.sessionForm.dataset.sessionType;
    if (sessionType === this.HTML_SESSION_TYPE.signIn) return this.sessionSignIn(email, password);
    this.sessionSignUp(email, password);
  }

  private sessionSignUp(email: string, password: string) {
    let webResponse: Response = null;

    this.api
      .post('/session/sign-up', { email, password })
      .then((response) => {
        webResponse = response;
        return webResponse.json();
      })
      .then((json) => {
        this.progressIndicator.hidden();
        switch (webResponse.status) {
          case 200:
            this.toaster.success('Olá, ' + json.user.name, () => window.location.reload());
            RestApiTool.updateToken(json.token);
            break;
          default:
            this.toaster.danger(json.error);
            break;
        }
      })
      .catch((error) => {
        this.progressIndicator.hidden();
        console.error(error);
      });
  }

  private sessionSignIn(email: string, password: string) {
    let webResponse: Response = null;

    this.api
      .post('/session', { email, password })
      .then((response) => {
        webResponse = response;
        return webResponse.json();
      })
      .then((json) => {
        this.progressIndicator.hidden();
        switch (webResponse.status) {
          case 200:
            this.toaster.success('Olá, ' + json.user.name, () => window.location.reload());
            RestApiTool.updateToken(json.token);
            break;
          default:
            this.toaster.danger(json.error);
            break;
        }
      })
      .catch((error) => {
        this.progressIndicator.hidden();
        console.error(error);
      });
  }
}

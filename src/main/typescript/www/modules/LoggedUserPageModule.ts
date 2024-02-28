import { UpdateUser } from '../auth/UpdateUser';
import { CSS_CLASS_INPUT_DANGER } from '../constants/css';
import { AnimTool } from '../tools/AnimTool';
import { ImageTool } from '../tools/ImageTool';
import { ProgressIndicatorTool } from '../tools/ProgressIndicatorTool';
import { RestApiTool } from '../tools/RestApiTool';
import { ToasterTool } from '../tools/ToasterTool';
import { UserEntityValidation } from '../validation/UserEntityValidation';

interface IAvatar {
  tool: ImageTool;
  HTMLImage: HTMLImageElement;
  input: HTMLInputElement;
  chooseButton: HTMLButtonElement;
  blob: Blob;
}

interface IInput {
  pseudoInput: HTMLElement;
  pseudoInputSpan: HTMLSpanElement;
  formContainer: HTMLElement;
  formContainerData: string[];
  form: HTMLElement;
  input: HTMLInputElement;
  originalValue: string;
  updateOn: Array<HTMLElement>;
}

interface IInputEmail extends IInput {
  passwordInput: HTMLInputElement;
}

export class LoggedUserPageModule {
  private readonly anim = new AnimTool();
  private readonly validation = new UserEntityValidation();
  private readonly progress = new ProgressIndicatorTool();
  private readonly api = new RestApiTool();
  private readonly toaster = new ToasterTool();

  private readonly avatar: IAvatar = {
    tool: new ImageTool(),
    HTMLImage: document.getElementById('avatar-IMG') as HTMLImageElement,
    input: document.getElementById('avatar-hidden-input') as HTMLInputElement,
    chooseButton: document.getElementById('choose-avatar-button') as HTMLButtonElement,
    blob: null,
  };

  private readonly name: IInput;

  private readonly email: IInputEmail;

  private readonly password = {
    pseudoInput: document.getElementById('pseudo-input-password'),
    formContainer: document.querySelector('.form-user-password-container') as HTMLElement,
    formContainerData: ['', ''],
    form: document.querySelector('.form-user-password') as HTMLElement,
    input: document.getElementById('new-password') as HTMLInputElement,
    inputConfirm: document.getElementById('new-password-again') as HTMLInputElement,
    inputCurrentPassword: document.getElementById('current-password') as HTMLInputElement,
    hiddenPassword: document.getElementById('hidden-password'),
    showPassword: document.getElementById('show-password'),
  };

  private readonly signOutButton = document.getElementById('sign-out-button') as HTMLButtonElement;

  constructor() {
    const pseudoInputName = document.getElementById('pseudo-input-name');
    const formContainerName = document.querySelector('.form-user-container') as HTMLElement;
    const formName = formContainerName.querySelector('.form-user-name') as HTMLElement;
    const inputName = formName.querySelector('input') as HTMLInputElement;
    const updateNameOn: Array<HTMLElement> = [document.getElementById('user-name-strong')];

    this.name = {
      pseudoInput: pseudoInputName,
      pseudoInputSpan: pseudoInputName.querySelector('span'),
      formContainer: formContainerName,
      formContainerData: ['', ''],
      form: formName,
      input: inputName,
      originalValue: inputName.dataset.original,
      updateOn: updateNameOn,
    };

    this.name.updateOn.push(this.name.pseudoInputSpan);

    const pseudoInputEmail = document.getElementById('pseudo-input-email');
    const formContainerEmail = document.querySelector('.form-user-email-container') as HTMLElement;
    const formEmail = formContainerEmail.querySelector('.form-user-email') as HTMLElement;
    const inputEmail = formEmail.querySelector('input') as HTMLInputElement;
    const passwordInputForEmail = formEmail.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;

    this.email = {
      pseudoInput: pseudoInputEmail,
      pseudoInputSpan: pseudoInputEmail.querySelector('span'),
      formContainer: formContainerEmail,
      formContainerData: ['', ''],
      form: formEmail,
      input: inputEmail,
      originalValue: inputEmail.dataset.original,
      updateOn: [],
      passwordInput: passwordInputForEmail,
    };

    this.email.updateOn.push(this.email.pseudoInputSpan);
  }

  public run() {
    this.processFormContainerDataset();
    this.setListeners();
    this.processBodySize();
    this.processPassword();
    this.progress.generate();
  }

  private processFormContainerDataset() {
    this.name.formContainerData = this.name.formContainer.dataset.originalPos.split('.');
    this.email.formContainerData = this.email.formContainer.dataset.originalPos.split('.');
    this.password.formContainerData = this.password.formContainer.dataset.originalPos.split('.');
  }

  private setListeners() {
    this.avatar.chooseButton.addEventListener('click', () => this.avatar.input.click());

    this.avatar.input.addEventListener('input', () => this.avatarProcessing());

    this.name.pseudoInput.addEventListener('click', () =>
      this.activeUserInputConfiguration(this.name)
    );
    this.name.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateName();
    });
    this.name.input.addEventListener('input', () => {
      if (!this.validation.nameIsValid(this.name.input.value)) {
        this.name.input.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.name.input.classList.remove(CSS_CLASS_INPUT_DANGER);
    });
    this.name.form.querySelector('.button-danger').addEventListener('click', () => {
      this.name.input.value = this.name.originalValue;
      this.disableUserInputConfiguration(this.name);
    });

    this.email.pseudoInput.addEventListener('click', () =>
      this.activeUserInputConfiguration(this.email)
    );
    this.email.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateEmail();
    });
    this.email.input.addEventListener('input', () => {
      if (!this.validation.emailIsValid(this.email.input.value)) {
        this.email.input.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.email.input.classList.remove(CSS_CLASS_INPUT_DANGER);
    });
    this.email.passwordInput.addEventListener('input', () => {
      if (!this.validation.passwordIsValid(this.email.passwordInput.value)) {
        this.email.passwordInput.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.email.passwordInput.classList.remove(CSS_CLASS_INPUT_DANGER);
    });
    this.email.form.querySelector('.button-danger').addEventListener('click', () => {
      this.email.input.value = this.email.originalValue;
      this.disableUserInputConfiguration(this.email);
    });

    this.signOutButton.addEventListener('click', () => this.signOut());
  }

  private processPassword() {
    this.password.showPassword.addEventListener('click', () => {
      this.password.showPassword.classList.add('d-none');
      this.password.hiddenPassword.classList.remove('d-none');

      this.password.input.type = 'text';
      this.password.inputConfirm.type = 'text';
      this.password.inputCurrentPassword.type = 'text';
    });

    this.password.hiddenPassword.addEventListener('click', () => {
      this.password.showPassword.classList.remove('d-none');
      this.password.hiddenPassword.classList.add('d-none');

      this.password.input.type = 'password';
      this.password.inputConfirm.type = 'password';
      this.password.inputCurrentPassword.type = 'password';
    });

    this.password.pseudoInput.addEventListener('click', () =>
      this.activeUserInputPasswordConfiguration()
    );

    this.password.form.querySelector('.button-danger').addEventListener('click', () => {
      const [attr, pos] = this.password.formContainerData;
      (this.password.formContainer.style as any)[attr] = pos;
    });

    this.password.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updatePassword();
    });

    this.password.input.addEventListener('input', () => {
      if (!this.validation.passwordIsValid(this.password.input.value)) {
        this.password.input.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      if (this.password.input.value !== this.password.inputConfirm.value) {
        this.password.input.classList.add(CSS_CLASS_INPUT_DANGER);
        this.password.inputConfirm.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      } else {
        this.password.input.classList.remove(CSS_CLASS_INPUT_DANGER);
        this.password.inputConfirm.classList.remove(CSS_CLASS_INPUT_DANGER);
      }
      this.password.input.classList.remove(CSS_CLASS_INPUT_DANGER);
    });

    this.password.inputConfirm.addEventListener('input', () => {
      if (!this.validation.passwordIsValid(this.password.inputConfirm.value)) {
        this.password.inputConfirm.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      if (this.password.input.value !== this.password.inputConfirm.value) {
        this.password.input.classList.add(CSS_CLASS_INPUT_DANGER);
        this.password.inputConfirm.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      } else {
        this.password.input.classList.remove(CSS_CLASS_INPUT_DANGER);
        this.password.inputConfirm.classList.remove(CSS_CLASS_INPUT_DANGER);
      }
      this.password.inputConfirm.classList.remove(CSS_CLASS_INPUT_DANGER);
    });

    this.password.inputCurrentPassword.addEventListener('input', () => {
      if (!this.validation.passwordIsValid(this.password.inputCurrentPassword.value)) {
        this.password.inputCurrentPassword.classList.add(CSS_CLASS_INPUT_DANGER);
        return;
      }
      this.password.inputCurrentPassword.classList.remove(CSS_CLASS_INPUT_DANGER);
    });
  }

  private activeUserInputConfiguration(configuration: IInput) {
    configuration.pseudoInput.style.borderColor = 'var(--secondary)';
    configuration.pseudoInputSpan.style.color = 'var(--title)';

    const [attr] = configuration.formContainerData;
    (configuration.formContainer.style as any)[attr] = '0';

    setTimeout(() => {
      configuration.pseudoInput.style.borderColor = '';
      configuration.pseudoInputSpan.style.color = '';
    }, 500);
  }

  private disableUserInputConfiguration(configuration: IInput) {
    const [attr, pos] = configuration.formContainerData;
    (configuration.formContainer.style as any)[attr] = pos;
  }

  private activeUserInputPasswordConfiguration() {
    const [attr] = this.password.formContainerData;
    (this.password.formContainer.style as any)[attr] = '0';
  }

  private async avatarProcessing() {
    if (this.avatar.input.files && this.avatar.input.files[0]) {
      const blob = await this.avatar.tool.imageToBlob(this.avatar.input.files[0]);
      if (blob) {
        this.avatar.blob = blob;
        this.avatar.HTMLImage.src = URL.createObjectURL(blob);
      }
    }
  }

  private processBodySize() {
    const headerH = document.querySelector('.header').clientHeight;
    const body = document.querySelector<HTMLDivElement>('#user-body');
    body.style.minHeight = `calc(100vh - ${headerH}px)`;
  }

  private updateName() {
    const name = this.name.input.value;
    if (!this.validation.nameIsValid(name)) {
      this.toaster.warn(this.name.input.dataset.error);
      this.anim.shake(this.name.input);
      return;
    }

    UpdateUser.userName(name, this.api)
      .then(({ json, status }) => {
        if (status === 200) {
          this.toaster.success(json.message);
          this.name.updateOn.forEach((element) => (element.textContent = name));
          this.disableUserInputConfiguration(this.name);
        } else {
          this.toaster.warn(json.error);
        }
      })
      .catch((e) => {
        this.toaster.danger();
        console.log(e);
      });
  }

  private updateEmail() {
    const email = this.email.input.value;
    if (!this.validation.emailIsValid(email)) {
      this.toaster.warn(this.email.input.dataset.error);
      this.anim.shake(this.email.input);
      return;
    }

    const password = this.email.passwordInput.value;
    if (!this.validation.passwordIsValid(password)) {
      this.toaster.warn(this.email.passwordInput.dataset.error);
      this.anim.shake(this.email.passwordInput);
      return;
    }

    UpdateUser.email(email, password, this.api)
      .then(({ json, status }) => {
        if (status === 200) {
          const { token } = json;
          RestApiTool.updateToken(token);
          this.toaster.success(json.message);
          this.email.updateOn.forEach((element) => (element.textContent = email));
          this.disableUserInputConfiguration(this.email);
        } else {
          this.toaster.warn(json.error);
        }
      })
      .catch((e) => {
        this.toaster.danger();
        console.log(e);
      });
  }

  private updatePassword() {
    const newPassword = this.password.input.value;
    if (newPassword !== this.password.inputConfirm.value) {
      this.anim.shake(this.password.inputConfirm);
      this.toaster.warn(this.password.inputConfirm.dataset.error);
      console.log({ newPassword, again: this.password.inputConfirm.value });
      return;
    }
    if (!this.validation.passwordIsValid(newPassword)) {
      this.anim.shake(this.password.input);
      this.toaster.warn(this.password.input.dataset.error);
      return;
    }
    const password = this.password.inputCurrentPassword.value;
    if (!this.validation.passwordIsValid(password)) {
      this.anim.shake(this.password.inputCurrentPassword);
      this.toaster.warn(this.password.inputCurrentPassword.dataset.error);
      return;
    }
    UpdateUser.password(newPassword, password, this.api)
      .then(({ json, status }) => {
        if (status === 200) {
          this.toaster.success(json.message);
          (this.password.form.querySelector('.button-danger') as HTMLButtonElement).click();
          this.password.input.value = '';
          this.password.inputConfirm.value = '';
          this.password.inputCurrentPassword.value = '';
        } else {
          this.toaster.warn(json.error);
          console.log(json);
        }
      })
      .catch((e) => {
        this.toaster.danger();
        console.log(e);
      });
  }

  private signOut() {
    this.progress.show();
    this.api
      .signOut()
      .then((isOK) => {
        if (isOK)
          this.toaster.success(this.signOutButton.dataset.message, () => window.location.reload());
        else this.toaster.danger('Oopss...');
        this.progress.hidden();
      })
      .catch((e) => {
        console.log(e);
        this.toaster.danger('Oopss...');
        this.progress.hidden();
      });
  }
}

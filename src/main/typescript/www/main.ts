import { LoggedUserPageModule } from './modules/LoggedUserPageModule';
import { NewQuizFormModule } from './modules/NewQuizFormModule';
import { SessionModule } from './modules/SessionModule';

class Main {
  public run() {
    const page = document.querySelector<HTMLInputElement>('#input-f-html-page-name');
    if (!page) return console.error('Input HTML page name not found - 404');
    if (!page.dataset.page) return console.error('Input HTML data page not defined - 400');

    switch (page.dataset.page) {
      case 'INDEX_PAGE':
        new SessionModule().run();
        break;
      case 'USER_PAGE':
        new SessionModule().run();
        break;
      case 'USER_PAGE_LOGGED_IN':
        new LoggedUserPageModule().run();
        break;
      case 'NEW_QUIZ_PAGE':
        new SessionModule().run();
        break;
      case 'NEW_QUIZ_PAGE_LOGGED_IN':
        new NewQuizFormModule().run();
        break;
    }
    this.preventAvatarCache();
  }

  private preventAvatarCache() {
    document.querySelectorAll('img').forEach((img) => {
      if (img.src.includes('/avatar/') && !img.src.includes('?query')) {
        console.error('Avatar IMG needs the query in its URL', img);
      }
    });
  }

  public static build() {
    return new Main();
  }
}

export default (() => Main.build().run())();

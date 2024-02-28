export class UserEntityValidation {
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  public emailIsValid(email: string) {
    return email && this.emailRegex.test(email);
  }

  public passwordIsValid(password: string) {
    return password && password.length >= 8;
  }

  public nameIsValid(name: string) {
    return name && name.length >= 2;
  }
}

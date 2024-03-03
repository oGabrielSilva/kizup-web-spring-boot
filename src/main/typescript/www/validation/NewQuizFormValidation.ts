export class NewQuizFormValidation {
  public static readonly FIELD_MAX_LENGTH = 100;

  public titleIsValid(title: string) {
    return title.length >= 5 && title.length <= NewQuizFormValidation.FIELD_MAX_LENGTH;
  }
}

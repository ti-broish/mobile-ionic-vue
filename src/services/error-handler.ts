import firebase from "firebase";

export const enum ErrorCommon {
  defaultError = "Възникна грешка. Моля опитайте отново.",
  wrongPassword = "Невалидна парола. Паролата трябва да съдържа 6 или повече символа.",
  wrongConfirmPassword = "Невалидна парола. Проверете дали паролите съвпадат.",
  invalidFirstName = "Невалидно име",
  invalidLastName = "Невалидна фамилия",
  invalidEmail = "Невалиден имейл адрес",
  invalidPhone = "Невалиден формат на телефонен номер.",
  invalidPin = "Невалидни цифри от ЕГН (последните 4)",
  invalidOrganization = "Невалидна организация",
  invalidCountry = "Моля изберете държава",
  invalidTown = "Моля изберете град",
  uploadPhotoError = "Грешка при качването на снимка"
}

export const enum ErrorProtocol {
  country = "Моля изберете държава",
  electionRegion = "Моля изберете МИР",
  municipality = "Моля изберете община",
  town = "Моля изберете населено място",
  cityRegion = "Моля изберете микрорайон",
  section = "Моля изберете секция"
}

export const enum ErrorViolation {
  country = "Моля изберете държава",
  electionRegion = "Моля изберете МИР",
  municipality = "Моля изберете община",
  town = "Моля изберете населено място",
  cityRegion = "Моля изберете микрорайон",
  section = "Моля изберете секция",
  description = "Мола въведете описание. Описанието трябва да бъде повече от 20 символа."
}

export class ErrorHandler {

  handleFirebaseError(error: firebase.auth.AuthError): string {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Имейл адреса е регистриран. Моля въведете друг имейл адрес.";
      case "auth/weak-password":
        return "Паролата трябва да съдържа 6 или повече символа.";
      case "auth/wrong-password":
        return ErrorCommon.wrongPassword;
      case "auth/user-not-found":
        return "Не е открит регистриран потребител с въведения имейл адрес.";
      case "auth/too-many-requests":
        return "Достъпа до акаунта е временно спрян. Променете вашата парола или опитайте по-късно.";
      default:
        return ErrorCommon.defaultError;
    }
  }

  handleAPIError(error: Record<string, any>): string {
    if (error.message && error.message.length > 0) {
      switch (error.statusCode) {
        case 401:
          return ErrorCommon.defaultError;
        default:
          if (Array.isArray(error.message) && error.message.length > 0) {
            return error.message[0];
          } else {
            return error.message;
          }
      }
    } else {
      return ErrorCommon.defaultError;
    }
  }
}
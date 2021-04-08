import { Organization } from "@/store/modules/organizations/types";

export class Validator {

  validateEmail(email: string): boolean {
    const re = /^(([^<>()\\.,;:\s@"]+(\.[^<>()\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }

  validatePhone(phone: string): boolean {
    const re = /^\+\(?[0-9]{1,3}\)?[-\s\\.]?[0-9]{3}[-\s\\.]?[0-9]{4,9}$/im;

    return re.test(String(phone));
  }

  validatePassword(password: string | null): boolean {
    if (password) {
      return password.length >= 6;
    }
    
    return false;
  }

  validateName(name: string | null): boolean {
    if (name) {
      return name.length > 0
    }

    return false
  }

  validatePin(pin: string | null): boolean {
    if (pin) {
      return pin.length === 4
    }

    return false
  }

  validateOrganization(organization: Organization | null): boolean {
    if (organization && organization.id && organization.name) {
      return organization.id != 0 && organization.name.length > 0;
    }

    return false;
  }
}
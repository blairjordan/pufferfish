import { HelperDelegate, registerHelper, registerPartial } from 'handlebars';
import { THelper } from '../../types';

export abstract class Helper implements THelper {
  ref: string;
  constructor(ref?: string)  { this.ref = ref ?? 'undefined'; }
  register(): void { registerHelper( this.ref, this.getHandlerFn() ); }
  getHandlerFn(): HelperDelegate { return (): string => 'undefined'; }
}

export abstract class Partial extends Helper {
  register(): void { registerPartial( this.ref, this.getHandlerFn()); }
}
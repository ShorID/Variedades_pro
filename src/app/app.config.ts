import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/supabase.service';
import { provideToastr } from 'ngx-toastr';
import { NgClickOutsideDirective } from 'ng-click-outside2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideToastr(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom([NgClickOutsideDirective]),
  ],
};

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpsInterceptor } from './https-interceptor';
import { JwtInterceptor } from './jwt-interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpsInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
];

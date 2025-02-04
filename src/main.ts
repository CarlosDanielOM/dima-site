import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import posthog from 'posthog-js';
import { environment } from './environments/environment';

posthog.init(
  environment.POSTHOG_KEY,
  {
    api_host: environment.POSTHOG_HOST,
    person_profiles: 'always'
  }
)

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

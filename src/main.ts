/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import posthog from 'posthog-js';
import { environment } from './environments/environment';

posthog.init(
  environment.POSTHOG_KEY,
  {
    api_host: environment.POSTHOG_HOST,
    person_profiles: 'always',
    capture_pageview: false,
    capture_pageleave: true
  }
)

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

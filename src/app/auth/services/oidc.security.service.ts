import { Injectable, EventEmitter, Output } from "@angular/core";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeInterval';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';
import { AuthConfiguration, OpenIDImplicitFlowConfiguration  } from '../modules/auth.configuration';

import { JwtKeys } from './jwtkeys';
import { AuthorizationResult } from './authorization-result.enum';
import { UriEncoder } from './uri-encoder';

/**
 * Implement this class-interface to create a custom storage.
 */
@Injectable()
export class OidcSecurityService {}
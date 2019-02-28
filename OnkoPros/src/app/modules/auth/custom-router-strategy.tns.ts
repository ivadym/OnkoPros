import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { NSRouteReuseStrategy} from 'nativescript-angular/router/ns-route-reuse-strategy';
import { NSLocationStrategy } from 'nativescript-angular/router/ns-location-strategy';

@Injectable()
export class CustomRouteReuseStrategy extends NSRouteReuseStrategy {

    constructor(location: NSLocationStrategy) {
        super(location);
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return false;
    }

}

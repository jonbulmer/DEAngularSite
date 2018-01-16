import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable()
export class OdcConfigService {
    @Output() onConfigurationLoaded = new EventEmitter<boolean>();
    clientConfigurationLoaded: any;
    clientConfiguration: any;
    wellKnownEndpoints: any;

    constructor() {}
    
    async load(configUrl: string) {
        const response = await fetch(configUrl);
        this.clientConfiguration = await response.json()
        await this.load_using_stsServer(this.clientConfiguration.stsServer);
    }

    async load_using_stsServer(stsServer: string) {
        const response = await fetch(`${stsServer}/.well-known/openid-configuration`);
        this.wellKnownEndpoints = await response.json()
        this.onConfigurationLoaded.emit();
    }

    async load_using_custom_stsServer(stsServer: string) {
        const response = await fetch(stsServer);
        this.wellKnownEndpoints = await response.json()
        this.onConfigurationLoaded.emit();
    }
}
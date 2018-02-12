import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable()
export class OidcConfigService {
    @Output() onConfigurationLoaded = new EventEmitter<boolean>();
    clientConfiguration: any;
    wellKnownEndpoints: any;
    
    async load(configUrl: string) {
        try {
            const response = await fetch(configUrl);
            if (response.ok) {
                throw new Error(response.statusText);
            }

            this.clientConfiguration = await response.json();
            await this.load_using_stsServer(this.clientConfiguration.stsServer);
        } catch (err) {
            console.error(
                `OidcConfigService 'load' threw an error on calling ${configUrl}`,
            err
          );
        }
        
        
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
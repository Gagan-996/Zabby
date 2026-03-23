import { Injectable } from '@angular/core';
import { TransferState, makeStateKey } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TransferStateService {

    constructor(private transferState: TransferState) { }

    get<T>(key: string) {
        const stateKey = makeStateKey<T>(key);

        if (this.transferState.hasKey(stateKey)) {
            return this.transferState.get(stateKey, null as any);
        }

        return null;
    }

    set<T>(key: string, data: T) {
        const stateKey = makeStateKey<T>(key);
        this.transferState.set(stateKey, data);
    }
}
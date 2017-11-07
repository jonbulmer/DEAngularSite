export { Comp } from './comp';
import { Comp } from './comp';

export const COMPANIES: Comp[] =
[
    new Comp(1,"Stockton GP", "","Mock"),
    new Comp(2,"Stockton Cards Club","","Mock")
];



export class CompanyFakeService {
    lastPromise: Promise<any>;
    getCompanies()  {
        return this.lastPromise = Promise.resolve<Comp[]>(COMPANIES); 
    }
}
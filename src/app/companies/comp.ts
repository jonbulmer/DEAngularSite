export class Comp {
    constructor(public Id = 0, public companyName = '',public companyDescription = '',public status = '') { }
    clone() { return new Comp(this.Id, this.companyName,this.companyDescription,this.status); }
  }


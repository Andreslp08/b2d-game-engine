export class Tags{
    private tags:Set<string>;

    constructor(){
        this.tags = new Set([]);
    }

    has(tag:string):boolean{
      return this.tags.has(tag);
    }

    add(tag:string):void{
        this.tags.add(tag);
    }

    getall():string[]{
       return Array.from(this.tags);
    }

    remove(tag:string):void{
        this.tags.delete(tag);
    }

    clear():void{
        this.tags.clear();
    }


}
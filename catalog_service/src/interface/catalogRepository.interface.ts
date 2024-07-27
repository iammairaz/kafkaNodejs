import { Product } from "../models/product.model";

export interface ICatelogRepository {
    create(data:Product): Promise<Product>;
    update(data:Product): Promise<Product>;
    delete(id:any): Promise<any>;
    find(limit:number, offset:number): Promise<Product[]>;
    findOne(id:Number): Promise<Product>; 
}
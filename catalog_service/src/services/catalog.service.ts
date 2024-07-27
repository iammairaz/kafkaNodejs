import { ICatelogRepository } from "../interface/catalogRepository.interface";
import '../config/config';

export class CatalogService {

    private _repository : ICatelogRepository
    constructor(repository:ICatelogRepository){
        this._repository = repository;
    }
    async createProduct(input:any) {
        const data = await this._repository.create(input);
        if(!data.id) {
            throw new Error("unable to create product")
        }
        return data;
    }
    async updateProduct(input:any) {
        const data = await this._repository.update(input);
        // emit event to update record in Elastic Search
        if(!data.id) {
            throw new Error("unable to updaate product")
        }
        return data;
    }

    //instead of this we will get products from Elastic Search
    async getProducts(limit:number,offset:number) {
        const products =  await this._repository.find(limit,offset);
        return products;
    }
    async getProduct(id:number) {
        const product = await this._repository.findOne(id);
        if(!product.id) {
            return new Error("product does not exist")
        }
        return product;
    }
    async deleteProduct(id:number) {
        const response = await this._repository.delete(id);
        // delete record from elastic search
        return response;
    }
}
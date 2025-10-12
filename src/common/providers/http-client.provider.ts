import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, Observable } from "rxjs";
import { AxiosRequestConfig, AxiosResponse } from "axios";

@Injectable()
export class HttpClientProvider {
    constructor(protected readonly httpService: HttpService) {}

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const observable = this.httpService.get<T>(url, config);
        return await this.handleSingleResponse(observable);
    }

    protected async getMany<T>(url: string, config?: AxiosRequestConfig): Promise<T[]> {
        const observable = this.httpService.get<T[]>(url, config);
        return await this.handleMultipleResponse(observable);
    }

    private async handleSingleResponse<T>(observable: Observable<AxiosResponse<T>>): Promise<T> {
        return firstValueFrom(observable.pipe(
            catchError((error) => {
                const HTTP_STATUS = parseInt(error?.response?.data?.status) || 500;
                const HTTP_MESSAGE = (HTTP_STATUS !== 500 && error?.message) 
                    ? error?.message 
                    : "Error al consultar con api externa";
                console.error({error: error?.message || HTTP_MESSAGE, url: error?.config?.url});
                throw new HttpException(HTTP_MESSAGE, HttpStatus.CONFLICT);
            })
        )).then((res) => res.data);
    }

    private async handleMultipleResponse<T>(observable: Observable<AxiosResponse<T[]>>): Promise<T[]> {
        return firstValueFrom(observable.pipe(
            catchError((error) => {
                const HTTP_STATUS = parseInt(error?.response?.data?.status) || 500;
                const HTTP_MESSAGE = (HTTP_STATUS !== 500 && error?.message) 
                    ? error?.message 
                    : "Error al consultar con api externa";
                console.error({error: error?.message || HTTP_MESSAGE, url: error?.config?.url});
                throw new HttpException(HTTP_MESSAGE, HttpStatus.CONFLICT);
            })
        )).then((res) => res.data);
    }
}
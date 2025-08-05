interface ApiOptions extends RequestInit{
    headers?: Record<string, string>;
}

//use StorageUtils abstraction for consistency
const getToken = (): string | null => sessionStorage.getItem('token');

export const apiCall = async (endpoint: string, options: ApiOptions = {}): Promise<Response> =>{
    const token = getToken();

    return fetch(endpoint,{
        ...options,
        headers:{
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
            ...options.headers,
        },
    });
};
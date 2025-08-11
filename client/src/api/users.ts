interface ApiOptions extends RequestInit{
    headers?: Record<string, string>;
}

//use StorageUtils abstraction for consistency
const getToken = (): string | null => sessionStorage.getItem('token');

export const apiCall = async (endpoint: string, options: ApiOptions = {}): Promise<Response> =>{
    const token = getToken();

    const response = await fetch(endpoint,{
        ...options,
        headers:{
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
            ...options.headers,
        },
    });


    if (response.status === 403) {
        sessionStorage.clear();
        window.location.href = '/login';
        throw new Error('Session expired - please log in again');
    }
    return response;
};
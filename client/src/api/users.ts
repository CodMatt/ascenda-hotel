interface ApiOptions extends RequestInit{
    headers?: Record<string, string>;
}

export const apiCall = async (endpoint: string, options: ApiOptions = {}): Promise<Response> =>{
    const token = localStorage.getItem('token');

    return fetch(endpoint,{
        ...options,
        headers:{
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
            ...options.headers,
        },
    });
};
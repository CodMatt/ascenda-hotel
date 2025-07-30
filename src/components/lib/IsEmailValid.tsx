
const isEmailValid = (email: string) => {

    const regex = /^[A-Z0-9._%+-]+@[A-Z.-]+\.[A-Z]{2,}$/i;
        
    if (regex.test(email)) {
        return true;
    } else {
        return false;
    }

}

export default isEmailValid;
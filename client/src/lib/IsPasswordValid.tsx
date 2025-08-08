
const isPasswordValid = (password: string) => {

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        
    if (password && password.length >= 8 && regex.test(password)) {
        return true;
    } else {
        return false;
    }

}

export default isPasswordValid;
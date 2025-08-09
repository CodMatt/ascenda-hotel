
const isNameValid = (name: string) => {

    const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
        
    if (name && regex.test(name) && name.length <= 50) {
        return true;
    } else {
        return false;
    }

}

export default isNameValid;

const isNameValid = (name: string) => {

    const regex = /^[a-zA-Z\s]*$/;
        
    if (name && regex.test(name)) {
        return true;
    } else {
        return false;
    }

}

export default isNameValid;
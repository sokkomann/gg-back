const joinService = (() => {

        const memberRegister = async (formData) => {
            console.log(formData);
            await fetch("/member/register", {
                method: "POST",
                body : formData
            })
        }
        return {
            memberRegister: memberRegister
        }
    })();

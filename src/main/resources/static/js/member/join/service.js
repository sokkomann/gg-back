const joinService = (() => {

        const memberRegister = async (formData) => {
            console.log(formData);
            const response = await fetch("/member/register", {
                method: "POST",
                body : formData
            })
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Fetch error");
            }

            return await response.json();

        }


        return {
            memberRegister: memberRegister
        }
    })();

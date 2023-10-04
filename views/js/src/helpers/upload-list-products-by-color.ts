import { fetchRequest } from "~/helpers/fetch"

const uploadListProductsByColor = async (idProduct: number) => {
    const contentArea = document.querySelector<HTMLElement>('.dropdown-screen[data-relation="popup-colors"] .dropdown-screen__content')

    if(!contentArea) return void 0

    contentArea.innerHTML = ''

    try {
        const response = await fetchRequest(
            `/?controller=product&action=getAttributesData&ajax=1&id_product=${idProduct}`,
            {}
        )

        contentArea.innerHTML = response.data.html
    } catch (error) {
        console.error(error)
    }
}

export {uploadListProductsByColor}

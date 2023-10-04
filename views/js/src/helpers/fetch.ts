import { FetchOptions } from "../interfaces/fetch"

const fetchRequest = async (url: string, parameters: FetchOptions) => {
    try {
        const response = await fetch(`${url}`, parameters)
        return await response.json()
    }
    catch (error) {
        console.log('Fetch json api data error: ', error)
    }
}

export {fetchRequest}

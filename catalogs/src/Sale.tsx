import axios from "axios"
import { useEffect, useState } from "react"
import { formatReal } from "./helpers/functions"

export function Sale() {

    const [response, setResponse] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get("http://localhost:5002/sales").then(resp => {
            setResponse(resp.data)
            setLoading(false)
        })
    }, [])

    return (
        <div className="pt-5 container mx-auto md:container md:mx-auto dark:bg-slate-800">
            <div>

                {loading &&
                <div className='flex min-h-screen justify-center items-center'>
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-teal-700"></div>
                </div>
                }

                <div className='p-10 bg-slate-900 grid grid-cols-1 md:grid-cols-1 gap-4 rounded-md'>

                    <h1 className="text-4xl text-center text-slate-400 uppercase">Lista de pedidos</h1>

                    <table className="mt-10 table-auto w-full text-left border-collapse text-slate-400">
                        <thead>
                            <tr>
                                <th className="border-b border-slate-500 p-2 uppercase">ID</th>
                                <th className="border-b border-slate-500 p-2 uppercase">Comprador</th>
                                <th className="border-b border-slate-500 p-2 uppercase">Livro</th>
                                <th className="border-b border-slate-500 p-2 uppercase">Preço</th>
                                <th className="border-b border-slate-500 p-2 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            { response?.map((item, key) => 
                                <tr key={key}>
                                    <td className="border-b border-slate-500 p-2">{ item.uuid }</td>
                                    <td className="border-b border-slate-500 p-2">{ item.name }</td>
                                    <td className="border-b border-slate-500 p-2">{ item.items[0].volumeInfo.title }</td>
                                    <td className="border-b border-slate-500 p-2">{ formatReal(item.items[0].saleInfo.listPrice.amount) }</td>
                                    <td className={`border-b border-slate-500 p-2 ${item.status == 'Pendente' ? 'text-yellow-400' : item.status == 'Negado' ? 'text-red-400' : 'text-green-400'}`}>{item.status}</td>
                                </tr>
                            ) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import './index.css'
import axios from 'axios'
import { formatReal } from './helpers/functions'

function App() {
  const [inputSearch, setInputSearch] = useState('')
  const [response, setResponse] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("http://localhost:5000/books").then(resp => {
      console.log(resp.data.items)
      setResponse(resp.data.items)
      setLoading(false)
    })
  }, [])

  const handleSearch = (event)  => {
    setLoading(true)

    setInputSearch(event.target.value)
    axios.get("http://localhost:5000/books?q="+event.target.value).then(resp => {
      setResponse(resp.data.items)
      setLoading(false)
    })
  }

  return (
    <div className="pt-5 container mx-auto md:container md:mx-auto dark:bg-slate-800">
  
      <div className='mt-5 mb-3 pt-10 pb-10 pr-20 pl-20 dark:bg-slate-900 border border-slate-800 flex justify-between gap-20 rounded-md'>
        <form className='w-full' action='javascript:void(0)'>
          <input type="text" className='p-5 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400' value={inputSearch} onChange={handleSearch} placeholder='Buscar livros no catálogo. Ex: Sherlock Holmes, Harry Potter ...' />
        </form>
      </div>

      <div>

        {loading &&
          <div className='flex min-h-screen justify-center items-center'>
                <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-teal-700"></div>
          </div>
        }

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          { response.map((item, key) => 
              <div key={key} className='mb-3 p-10 dark:bg-slate-900 shadow-xl shadow-slate-900 rounded-md'>
                <div className='flex flex-col justify-between'>
                  <div className='rounded-md flex-grow'>
                    <img src={`http://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`} alt={item.volumeInfo.title} className='w-full h-64 rounded-md' />
                  </div>
                  
                  <div className='mt-4 h-36'>
                    <h2 className='text-md text-center uppercase text-zinc-400'>{item.volumeInfo.title.substring(0, 100)}</h2>
                    <div className='relative mt-5 text-center text-zinc-400'>
                      { item.volumeInfo.categories?.map((item, key) =>
                        <p key={key} >{item}</p>  
                      ) }
                      <p className='mt-3 text-center text-2xl uppercase text-teal-300'>{ formatReal(item.saleInfo.listPrice.amount) }</p>
                    </div>
                  </div>
                  <div className='relative mt-5'>
                    <a href={`/checkout/${item.id}`} className='block w-full p-4 text-sm text-center bg-teal-700 hover:bg-teal-800 text-white uppercase rounded-md'>Comprar</a>
                  </div>
                </div>
              </div> 
            ) }
          </div>
        </div>
      </div>
  )
}

export default App

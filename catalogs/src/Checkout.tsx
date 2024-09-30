import { useCallback, useEffect, useState } from 'react'
import { formatDate, formatReal } from './helpers/functions'
import axios from 'axios'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { IMaskInput } from 'react-imask'
import { useKeycloak } from '@react-keycloak/web';

type TUserInfo = {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    preferred_username: string;
    sub: string;
  }

function Checkout() {
    const { id } = useParams()
    const [response, setResponse] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(false)
    const { keycloak, initialized } = useKeycloak();
    const [userInfo, setUserInfo] = useState('');

    const createCheckoutFormSchema = z.object({
        book_id: z.string(),
        document: z.string().nonempty("O campo CPF é obrigatório"),
        name: z.string().nonempty("O campo nome é obrigatório").trim(),
        phone: z.string().nonempty("O campo telefone é obrigatório"),
        email: z.string()
            .nonempty("O campo e-mail é obrigatório")
            .email("O campo e-mail deve conter um valor válido"),
        postal_code: z.string().nonempty("O campo CEP é obrigatório"),
        number: z.string().nonempty("O campo número é obrigatório"),
        address: z.string().nonempty("O campo endereço é obrigatório"),
        neighborhood: z.string().nonempty("O campo bairro é obrigatório"),
        town: z.string().nonempty("O campo cidade é obrigatório"),
        state: z.string().nonempty("O campo estado é obrigatório")
    })
    
    const {
        register,
        control,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors, isDirty, isValid } 
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            book_id: id,
            document: '',
            name: '',
            email: '',
            phone: '',
            postal_code: '',
            number: '',
            address: '',
            neighborhood: '',
            town: '',
            state: ''
        },
        resolver: zodResolver(createCheckoutFormSchema)
    })

    // Enquanto não inicia a sessão, deve mostrar loading...
  !initialized && <div>Loading...</div>

  // Busca informações do usuário e grava no estado userInfo
  const fetchUserInfo = useCallback(async () => {
    if (initialized && keycloak.authenticated) {
      const { name } = await keycloak.loadUserInfo() as TUserInfo;

      setUserInfo(name);
    }
  }, [initialized, keycloak]);


    // Desloga o usuário
    const handleLogout = () => {
        keycloak.logout({
            redirectUri: 'http://localhost:5173/'
        });
    };

    useEffect(() => {
        axios.get(`http://localhost:5000/books/${id}`).then(resp => {
        setResponse(resp.data)
        setLoading(false)
        })
    }, [initialized, keycloak, fetchUserInfo])

    const onSubmit = (data:any) => {
        axios.post("http://localhost:5001/checkout", data).then(() => {
            setMessage(true)
        }).catch(resp => {
            console.log(resp)
        })
    }

    const getCEP = () => {
        axios.get(`https://viacep.com.br/ws/${getValues('postal_code')}/json/`)
        .then(response => {
            setValue('address', response.data.logradouro, {shouldValidate: true, shouldDirty: true})
            setValue('neighborhood', response.data.bairro, {shouldValidate: true, shouldDirty: true})
            setValue('town', response.data.localidade, {shouldValidate: true, shouldDirty: true})
            setValue('state', response.data.uf, {shouldValidate: true, shouldDirty: true})
        })
        .catch(() => {
             alert('CEP não encontrado')
        }).finally(() => {
            //
        })
    }

    return (
        <div className="pt-5 container mx-auto md:container md:mx-auto dark:bg-slate-800">

            {loading ?
                <div className='flex min-h-screen justify-center items-center'>
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-teal-700"></div>
                </div>
            : (
                <div>
                    
                    <div className='w-full flex justify-end'>
                        <button onClick={handleLogout} className='p-3 bg-teal-700 hover:bg-teal-800 text-white rounded-md'>LOGOUT</button>
                    </div>

                    <div className='mt-3 mb-3 pt-5 pb-5 pr-20 pl-20 dark:bg-slate-900 border border-slate-800 rounded-md'>
                        <ul className='text-white text-md uppercase flex space-x-4'>
                            <li><a href="/" className='hover:underline'>Início</a></li>
                            <li>/</li>
                            <li className='text-teal-400'>Checkout - {response.volumeInfo?.title}</li>
                        </ul>
                    </div>

                    <div className='mt-5 flex flex-row gap-4'>
                        <div className='basis-9/12 mb-3 pt-10 pb-10 pr-20 pl-20 dark:bg-slate-900 border border-slate-800 flex flex-col justify-between gap-20 rounded-md'>
                            
                            <h1 className='text-white text-3xl uppercase'>dados do checkout</h1>

                            { message && 
                                <div className='p-5 w-full bg-green-700 text-white rounded-md'>Pedido realizado, estamos processando seu pagamento !</div>
                            }

                            <form className='w-full flex flex-col gap-4'>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>CPF: <span className='text-red-600'>*</span></label>
                                        <Controller
                                            control={control}
                                            name="document"
                                            render={({ field: { onChange, onBlur, ref } }) => (
                                                <IMaskInput 
                                                    mask={'000.000.000-00'} 
                                                    className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 uppercase ${errors.name ? 'border border-red-600' : ''}`} 
                                                    placeholder='___.___.___-__'
                                                    onBlur={onBlur}
                                                    onChange={onChange}
                                                    inputRef={ref} />
                                            )} />

                                        { errors.document && <div className="text-red-600">{errors.document.message}</div> }
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Nome: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("name")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 uppercase ${errors.name ? 'border border-red-600' : ''}`} placeholder='Ex: John Joe' />
                                        { errors.name && <div className="text-red-600">{errors.name.message}</div> }
                                    </div>
                                </div>


                                <div className='flex flex-col gap-2'>
                                    <label className='text-slate-400'>Telefone: <span className='text-red-600'>*</span></label>

                                    <Controller
                                        control={control}
                                        name="phone"
                                            render={({ field: { onChange, onBlur, ref } }) => (
                                            <IMaskInput 
                                                mask={'(00) 00000-0000'}
                                                className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 uppercase ${errors.name ? 'border border-red-600' : ''}`} 
                                                placeholder='(__) _____-____'
                                                onBlur={onBlur}
                                                onChange={onChange}
                                                inputRef={ref} />
                                            )} /> 

                                    { errors.phone && <div className="text-red-600">{errors.phone.message}</div> }
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label className='text-slate-400'>E-mail: <span className='text-red-600'>*</span></label>
                                    <input type="text" {...register("email")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.email ? 'border border-red-600' : ''}`} placeholder='Ex: john.joe@exemplo.com' />
                                    { errors.email && <div className="text-red-600">{errors.email.message}</div> }
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>CEP: <span className='text-red-600'>*</span></label>
                                        
                                        <Controller
                                            control={control}
                                            name="postal_code"
                                            render={({ field: { onChange, ref } }) => (
                                            <IMaskInput 
                                                mask={'00000-000'}
                                                className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 uppercase ${errors.name ? 'border border-red-600' : ''}`} 
                                                placeholder='_____-___'
                                                onBlur={getCEP}
                                                onChange={onChange}
                                                inputRef={ref} />
                                            )}/> 

                                        { errors.postal_code && <div className="text-red-600">{errors.postal_code.message}</div> }
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Número: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("number")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.number ? 'border border-red-600' : ''}`} />
                                        { errors.number && <div className="text-red-600">{errors.number.message}</div> }
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Endereço: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("address")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.address ? 'border border-red-600' : ''}`} />
                                        { errors.address && <div className="text-red-600">{errors.address.message}</div> }
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Bairro: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("neighborhood")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.neighborhood ? 'border border-red-600' : ''}`} />
                                        { errors.neighborhood && <div className="text-red-600">{errors.neighborhood.message}</div> }
                                    </div>
                                </div>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Cidade: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("town")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.town ? 'border border-red-600' : ''}`} />
                                        { errors.town && <div className="text-red-600">{errors.town.message}</div> }
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-slate-400'>Estado: <span className='text-red-600'>*</span></label>
                                        <input type="text" {...register("state")} className={`p-3 w-full border border-slate-700 bg-slate-700 rounded-md placeholder:text-md placeholder:text-zinc-400 text-zinc-400 ${errors.state ? 'border border-red-600' : ''}`} />
                                        { errors.state && <div className="text-red-600">{errors.state.message}</div> }
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className='basis-1/3 mb-3 pt-10 pb-10 pr-20 pl-20 dark:bg-slate-900 border border-slate-800 flex flex-col justify-between gap-20 rounded-md'>
                            
                            <h3 className='text-white text-xl uppercase'>Informações Gerais</h3>
                            
                            <div className='text-slate-300 text-md flex flex-col gap-2'>
                                <img src={`http://books.google.com/books/content?id=${response.id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`} alt={response.volumeInfo.title} className='w-48 h-52 rounded-md' />
                                <p><strong>ID: </strong>{ response.id }</p>
                                <p><strong>Título: </strong><span className='uppercase'>{ response.volumeInfo?.title }</span></p>
                                <p><strong>Data Publicação:</strong>{formatDate(response.volumeInfo?.publishedDate)}</p>
                                <p><strong>Páginas: </strong>{ response.volumeInfo?.pageCount }</p>
                                <p><strong>Autores: </strong>
                                    { response.volumeInfo?.authors.map((item, key) =>
                                        <span key={key}>{item}</span>
                                    )}
                                </p>
                                <p className='mt-5'><strong>Preço: </strong><span className='text-xl'>{formatReal(response.saleInfo.listPrice.amount)}</span></p>
                            </div>

                            <div>
                                <button onClick={handleSubmit(onSubmit)} disabled={!isDirty || !isValid} className='disabled:bg-slate-800 disabled:cursor-not-allowed w-full p-3 bg-teal-700 hover:bg-teal-800 text-white rounded-md'>FINALIZAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Checkout

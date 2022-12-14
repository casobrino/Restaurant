import { useState, useEffect, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/router'

const QuioscoContext = createContext();

const QuioscoProvider = ({ children }) => {
    //Use state para modificar la primera carga
    const [categorias, setCategorias] = useState([])
    const [categoriaActual, setCategoriaActual] = useState({})
    const [producto, setProducto] = useState({})
    const [modal, setModal] = useState(false)
    const [pedido, setPedido] = useState([])
    const [nombre, setNombre] = useState('')
    const [total, setTotal] = useState(0.0)
    const router = useRouter()

    //Hace una consulta axios a la api
    const obtenerCategorias = async () => {
        const { data } = await axios('/api/categorias') //Data viene del Json
        setCategorias(data) //Rellena el arreglo
    }

    //Llena el arreglo con las categorias
    useEffect(() => {
        obtenerCategorias()
    }, [])

    //Selecciona una categoria por default
    useEffect(() => {
        setCategoriaActual(categorias[0]) //asigna la llave 0
    }, [categorias])


    //Effect que cambia con cada producto y actualiza el total
    useEffect(() => {
        const nuevoTotal = pedido.reduce((total, producto) => (producto.precio * producto.cantidad) + total, 0)

        setTotal(nuevoTotal)
    }, [pedido])


    //Metodo para obtener la categoria seleecionada
    const handleClicCategoria = id => {
        const categoria = categorias.filter(cate => cate.id === id)
        setCategoriaActual(categoria[0]);
        router.push('/')
    }

    //Agregar producto para seleccionado
    const handleSetProducto = producto => {
        setProducto(producto)
    }

    //Cambia el modal, la alerta a otro estado inmediato
    const handleChangeModal = () => {
        setModal(!modal)
    }


    //Se aplica el destrcturing a categoriaID e imagen para que nos e guarde en el state de producto
    const handleAgregarPedido = ({ categoriaId, ...producto }) => {
        //Evitar produictos repetidos
        if (pedido.some(productoState => productoState.id === producto.id)) {
            //si el priducto existe, se actualiza los pedidos
            const pedidoActualizado = pedido.map(productoState => productoState.id === producto.id ? producto : productoState);
            setPedido(pedidoActualizado)
            toast.success('Pedido Actualizado');
        }
        else {
            //se agrega unicamente el pedido sin catId e imagen
            setPedido([...pedido, producto]);
            toast.success('Pedido agregado');
        }

        setModal(false)

    }

    //Edita cantidad filtrandolo mientras el id sea el mismo
    const handleEditarCantidades = (id) => {
        const productoActualizar = pedido.filter(producto => producto.id === id)
        setProducto(productoActualizar[0])
        //Iniciamos el modal de nuevo para cambiarlo de estado
        setModal(!modal)
    }

    //Filtra todos los pedidos menos el dado - ELIMINA
    const handleEliminarProducto = (id) => {
        const pedidoActualizado = pedido.filter(producto => producto.id !== id)
        setPedido(pedidoActualizado)

    }

    //Coloca orden con el pedido y el total
    const colocarOrden = async (e) => {
        e.preventDefault()
        try {
            await axios.post('/api/ordenes', { pedido, nombre, total, fecha: Date.now().toString() })

            //Resetear la app
            setCategoriaActual(categorias[0])
            setPedido([])
            setNombre('')
            setTotal(0.0)

            toast.success('Pedido realizado correctamente')
            setTimeout(() => {
                router.push('/')
            }, 2000);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        //Envia los datos generales al provaider
        <QuioscoContext.Provider
            value={{
                producto,
                categorias,
                categoriaActual,
                modal,
                pedido,
                nombre,
                total,
                handleClicCategoria,
                handleSetProducto,
                handleChangeModal,
                handleAgregarPedido,
                handleEditarCantidades,
                handleEliminarProducto,
                setNombre,
                colocarOrden
            }}
        >
            {children}
        </QuioscoContext.Provider>
        //Children es todo lo que no le envias
    )
}

export {
    QuioscoProvider
}
export default QuioscoContext
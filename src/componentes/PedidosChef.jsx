import React, { Fragment } from 'react'
import { db } from '../firebase'
import '../estilos/pedidoschef.css'
const hmh = require('hmh');

const PedidosChef = () => {

    const [orders, getOrders] = React.useState([])
    const [orderdone, setOrderDone] = React.useState([])
    const [delivery, setDelivery] = React.useState([])

    React.useEffect(() => {
        db.collection('pedidos').where('status', '==', 'pending').onSnapshot({ includeMetadataChanges: true }, (snap => {
            const pedidos = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            getOrders(pedidos);
        })
        )
        db.collection('pedidos').where('status', '==', 'delivered').onSnapshot((snap => {
            const pedidos = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
            setDelivery(pedidos);
        })
        )
    }, [])

    const orderDone = (item) => {
        db.collection('pedidos').doc(item.id).update({
            status: 'done',
            hourDone: new Date().getTime(),
        })
        .then(() => {
            setOrderDone([...orderdone, { ...item, status: 'done', hourDone: new Date().getTime() }])
        })
        if (item.status === 'done') {
            const index = orders.findIndex((i) => i.id === item.id)
            orders.splice(index, 1);
        }
    }
    
    return (
        <Fragment>
        <div className="container">
            <h2>Pedidos a realizar</h2>
            <div className="row row-cols-3 ">
                {orders.map((order) => { 
                return (
                    <div className="">
                        <section className="section" key={order.id}  >
                            <div className="row columnLength">
                                <p className="text client-text"> Cliente: {order.cliente}</p>
                                <p className="text client-text"> Mesas: {order.numMesa}</p>
                                <span className="menu-name text">Pedidos:</span>
                                {order.pedido.map(item => <span className="order-kitchen" key={item.id}>
                                    <ul>
                                        <li> {item.countProducto} {item.nombreProducto} </li>    
                                    </ul> 
                                </span>)}
                                <div>
                                    <button class="btn-enviar burger-queen">Cancelar</button>
                                    <button class="btn-enviar burger-queen" onClick={() => orderDone(order)}>Listo</button>
                                </div>
                            </div>
                        </section>
                    </div>
                )
                })}
            </div>
        </div>
       
        <div className="container">
          <h2 className="h2">Pedidos entregues</h2>
          <div className="col-sm-6">
              {delivery.map((item, index) => {
              const send = `${new Date(item.hourSend).getHours()}h ${new Date(item.hourSend).getMinutes()}m`;
              const hDelivered = `${new Date(item.hourDelivered).getHours()}h ${new Date(item.hourDelivered).getMinutes()}m`;
              const difftime = (hmh.diff(`${send}`, `${hDelivered}`).toString());
              return (
                <div className="order-done" key={index} >
                    {item.status === 'delivered' ?
                    <section className="section">
                        <div className="order-div">
                            <div className="menu-name">
                                <p className="card-title"> Cliente: {item.cliente}</p>
                                <p className="card-title"> Mesa: {item.numMesa}</p>
                            </div>
                            <div className="order-itens">
                                <span className="menu-name text">Pedidos:</span>
                                {item.pedido.map((item, index) =>
                                <span className="order-kitchen" key={index}> {item.nombreProducto}  {item.countProducto}</span>)}
                                <span className="time">Tempo de preparo:{difftime}</span>
                            </div>
                        </div>
                    </section>

                    : null}

                </div>                  

              )
              })}

            </div>
        </div>    
    </Fragment>
)
}

export default PedidosChef

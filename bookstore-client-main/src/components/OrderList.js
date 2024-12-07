import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';

function OrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/orders/')
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Мои заказы</h2>
      {orders.map(order => (
        <div key={order.id} className="order-card mb-3">
          <h5>Заказ №{order.id}</h5>
          <p>Статус: {order.status}</p>
          <p>Дата заказа: {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Общая стоимость: {order.total_price.toFixed(2)} ₴</strong></p>
          <h6>Книги:</h6>
          <ul>
          {order.books_read && order.books_read.map(item => (
            <li key={item.book}>
              {item.book_title} x {item.book_quantity}
            </li>
          ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default OrderList;
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import AuthContext from '../context/AuthContext';

function Checkout() {
  const { authTokens } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [orderCreated, setOrderCreated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/cart/')
      .then(response => {
        setCartItems(response.data);
        if (response.data.length === 0) {
          navigate('/');
        }
      })
      .catch(error => console.error(error));
  }, []);

  const handleConfirmOrder = () => {
    axiosInstance.post('/api/orders/', {
      books: cartItems.map(item => ({
        book: item.book.id,
        book_quantity: item.quantity,
      })),
    })
    .then(() => {
      alert('Заказ успешно оформлен');
      setOrderCreated(true);
      navigate('/orders');
    })
    .catch(error => console.error(error));
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.book.price * item.quantity, 0);

  return (
    <div className="checkout-page">
      <div className="customer-info">
        {/* {authTokens ? (
          <p>Электронная почта: {authTokens.email}</p>
        ) : (
          // Форма регистрации или входа
        )} */}
      </div>
      <div className="order-summary">
        <h2>Ваш заказ</h2>
        {cartItems.map(item => (
          <div key={item.id} className="order-item">
            <p>{item.book.title} x {item.quantity}</p>
            <p>{item.book.price * item.quantity} ₴</p>
          </div>
        ))}
        <p><strong>Общая цена: {totalPrice} ₴</strong></p>
        <button onClick={handleConfirmOrder}>Подтвердить заказ</button>
      </div>
    </div>
  );
}

export default Checkout;
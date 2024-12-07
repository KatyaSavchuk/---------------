import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axiosInstance from '../api/axiosConfig';

function Cart({ show, handleClose }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (show) {
      axiosInstance.get('/api/cart/')
        .then(response => setCartItems(response.data))
        .catch(error => console.error(error));
    }
  }, [show]);

  const handleRemove = (id) => {
    axiosInstance.delete(`/api/cart/${id}/`)
      .then(() => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      })
      .catch(error => console.error(error));
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.book.price * item.quantity, 0);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Корзина</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cartItems.length === 0 ? (
          <p>Корзина пуста</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="d-flex mb-2">
              <img src={`https://covers.openlibrary.org/b/isbn/${item.book.isbn}-S.jpg`} alt={item.book.title} className="me-2" />
              <div className="flex-grow-1">
                <p>{item.book.title}</p>
                <p>Количество: {item.quantity}</p>
                <p>Цена: {parseFloat(item.book.price).toFixed(2)} ₴</p>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)}>Удалить</button>
            </div>
          ))
        )}
        <p><strong>Общая цена: {totalPrice.toFixed(2)} ₴</strong></p>
      </Modal.Body>
      <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>Закрыть</Button>
        {cartItems.length > 0 && (
          <Button variant="primary" href="/checkout">Перейти к оформлению заказа</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default Cart;
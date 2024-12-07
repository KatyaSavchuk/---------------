import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Cart from './Cart';

function Header() {
  const { authTokens, user, logout } = useContext(AuthContext);
  const [showCart, setShowCart] = useState(false);

  const handleCartOpen = () => setShowCart(true);
  const handleCartClose = () => setShowCart(false);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">BookStore</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleCartOpen}>Корзина</button>
              </li>
              {authTokens ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/orders">Мои заказы</Link>
                  </li>
                  {user.is_staff && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">Админ-панель</Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" onClick={logout}>Выход</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Регистрация/Логин</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Cart show={showCart} handleClose={handleCartClose} />
    </header>
  );
}

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <section className="about-section">
        <h2>О нас</h2>
        <p>Наш магазин открылся недавно, но уже привлёк множество покупателей.</p>
      </section>
      <section className="feature-section">
        <h2>Наша фишка</h2>
        <p>Предпросмотр книги перед покупкой, доступный только авторизированным пользователям.</p>
      </section>
      <Link to="/books" className="explore-button">Отправиться искать книги</Link>
    </div>
  );
}

export default HomePage;

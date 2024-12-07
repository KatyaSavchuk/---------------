import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function BookDetail() {
  const { id } = useParams();
  const { authTokens } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/api/books/${id}/`)
      .then(response => setBook(response.data))
      .catch(error => console.error(error));

    axiosInstance.get(`/api/books/${id}/reviews/`)
      .then(response => setReviews(response.data))
      .catch(error => console.error(error));
  }, [id]);

  const handleAddToCart = () => {
    axiosInstance.post('/api/cart/', {
      book_id: book.id,
      quantity: 1,
    })
    .then(() => {
      alert('Книга добавлена в корзину');
    })
    .catch(error => console.error(error));
  };

  const handlePreview = async () => {
    try {
      const response = await axiosInstance.get(`/api/books/${id}/preview/`, {
        responseType: 'blob',
      });

      const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL);
    } catch (error) {
      console.error('Ошибка при получении превью', error);
      alert('Не удалось загрузить превью');
    }
  };

  if (!book) return <div>Загрузка...</div>;

  return (
    <div className="book-detail-page">
      <div className="book-detail">
        <img src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`} alt={book.title} />
        <div className="book-info">
          <h1>{book.title}</h1>
          <p>{book.description}</p>
          <p><strong>{book.price} ₴</strong></p>
          <button onClick={handleAddToCart}>Добавить в корзину</button>
          <button onClick={handlePreview}>Посмотреть превью</button>
        </div>
      </div>
      <div className="reviews">
        <h2>Отзывы</h2>
        {reviews.map(review => (
          <div key={review.id} className="review">
            <p><strong>{review.user_email}</strong></p>
            <p>Рейтинг: {review.rating}</p>
            <p>{review.comment}</p>
          </div>
        ))}
        {authTokens && (
          <div className="add-review">
            {/* Форма для добавления отзыва */}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { Button, Modal, Form, Table } from 'react-bootstrap';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);

  // Состояния для модальных окон и форм
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    stock: '',
    isbn: '',
    published_date: '',
    preview_file: null,
  });

  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: '',
    comment: '',
    
  });

  useEffect(() => {
    if (activeTab === 'books') {
      loadBooks();
    } else if (activeTab === 'reviews') {
      loadReviews();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadBooks = () => {
    axiosInstance.get('/api/books/')
      .then(response => setBooks(response.data))
      .catch(error => console.error(error));
  };

  const loadReviews = () => {
    axiosInstance.get('/api/reviews/')
      .then(response => setReviews(response.data))
      .catch(error => console.error(error));
  };

  const loadOrders = () => {
    axiosInstance.get('/api/orders/all_orders/')
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  };

  // Функции для книг
  const handleAddBook = () => {
    setBookFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      stock: '',
      isbn: '',
      published_date: '',
    });
    setShowAddBookModal(true);
  };

  const handleEditBook = (book) => {
    setBookFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      stock: book.stock,
      isbn: book.isbn,
      published_date: book.published_date,
      
    });
    setShowEditBookModal(true);
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('Вы уверены, что хотите удалить книгу?')) {
      axiosInstance.delete(`/api/books/${bookId}/`)
        .then(() => loadBooks())
        .catch(error => console.error(error));
    }
  };

  const handleBookFormChange = (e) => {
    setBookFormData({
      ...bookFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookFormFileChange = (event) => {
    setBookFormData({
      ...bookFormData,
      preview_file: event.target.files[0], // Сохраняем файл в состояние
    });
  };

  const submitNewBook = () => {
    const data = new FormData();
    Object.entries(bookFormData).forEach(([key, value]) => {
      data.append(key, value);
    });
  
    axiosInstance.post('/api/books/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        loadBooks();
        setShowAddBookModal(false);
      })
      .catch(error => console.error(error));
  };

  const submitEditBook = () => {
    const data = new FormData();
    Object.entries(bookFormData).forEach(([key, value]) => {
      data.append(key, value);
    });
  
    axiosInstance.put(`/api/books/${bookFormData.id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        loadBooks();
        setShowEditBookModal(false);
      })
      .catch(error => console.error(error));
  };

  // Функции для отзывов
  const handleEditReview = (review) => {
    setReviewFormData({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      book_id: review.book,
      
    });
    setShowEditReviewModal(true);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Вы уверены, что хотите удалить отзыв?')) {
      axiosInstance.delete(`/api/reviews/${reviewId}/`)
        .then(() => loadReviews())
        .catch(error => console.error(error));
    }
  };

  const handleReviewFormChange = (e) => {
    setReviewFormData({
      ...reviewFormData,
      [e.target.name]: e.target.value,
    });
  };

  const submitEditReview = () => {
    axiosInstance.patch(`/api/books/${reviewFormData.book_id}/reviews/${reviewFormData.id}/`, reviewFormData)
      .then(() => {
        loadReviews();
        setShowEditReviewModal(false);
      })
      .catch(error => console.error(error));
  };

  // Функции для заказов
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    axiosInstance
      .patch(`/api/orders/${orderId}/admin/`, { status: newStatus })
      .then(() => loadOrders())
      .catch(error => console.error(error));
  };

  return (
    <div className="admin-panel">
      <h1>Админ-панель</h1>
      <nav>
        <ul className="nav nav-tabs">
          <li className="nav-item" onClick={() => setActiveTab('books')}>
            <span className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}>Книги</span>
          </li>
          <li className="nav-item" onClick={() => setActiveTab('reviews')}>
            <span className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}>Отзывы</span>
          </li>
          <li className="nav-item" onClick={() => setActiveTab('orders')}>
            <span className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}>Заказы</span>
          </li>
        </ul>
      </nav>
      <div className="admin-content mt-4">
        {/* Вкладка Книги */}
        {activeTab === 'books' && (
          <div className="admin-section">
            <h2>Книги</h2>
            <Button variant="primary" className="mb-3" onClick={handleAddBook}>Добавить книгу</Button>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Автор</th>
                  <th>Цена</th>
                  <th>ISBN</th>
                  <th>Превью</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{parseFloat(book.price).toFixed(2)} ₴</td>
                    <td>{book.isbn}</td>
                    <td>
                      {book.preview_file ? (
                        <a href={book.preview_file} target="_blank" rel="noopener noreferrer">Скачать превью</a>
                      ) : (
                        'Нет превью'
                      )}
                    </td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEditBook(book)}>Редактировать</Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => handleDeleteBook(book.id)}>Удалить</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Вкладка Отзывы */}
        {activeTab === 'reviews' && (
          <div className="admin-section">
            <h2>Отзывы</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Пользователь</th>
                  <th>Книга</th>
                  <th>Рейтинг</th>
                  <th>Комментарий</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.user_email}</td>
                    <td>{review.book_title}</td>
                    <td>{review.rating}</td>
                    <td>{review.comment}</td>
                    <td>
                      <Button variant="warning" size="sm" onClick={() => handleEditReview(review)}>Редактировать</Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.id)}>Удалить</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Вкладка Заказы */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>Заказы</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Пользователь</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_email}</td>
                    <td>{parseFloat(order.total_price).toFixed(2)} ₴</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="pending">В обработке</option>
                        <option value="completed">Доставлен</option>
                        <option value="canceled">Отменен</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Модальные окна */}

      {/* Модальное окно Добавить книгу */}
      <Modal
        show={showAddBookModal}
        onHide={() => setShowAddBookModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Добавить книгу</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={bookFormData.title}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Автор</Form.Label>
              <Form.Control
                type="text"
                name="author"
                value={bookFormData.author}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={bookFormData.description}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={bookFormData.price}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Количество на складе</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={bookFormData.stock}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={bookFormData.isbn}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Дата публикации</Form.Label>
              <Form.Control
                type="date"
                name="published_date"
                value={bookFormData.published_date}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Превью (PDF)</Form.Label>
              <Form.Control
                type="file"
                name="preview_file"
                onChange={handleBookFormFileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddBookModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={submitNewBook}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно Редактировать книгу */}
      <Modal
        show={showEditBookModal}
        onHide={() => setShowEditBookModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Редактировать книгу</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={bookFormData.title}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Автор</Form.Label>
              <Form.Control
                type="text"
                name="author"
                value={bookFormData.author}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={bookFormData.description}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={bookFormData.price}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Количество на складе</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={bookFormData.stock}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={bookFormData.isbn}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Дата публикации</Form.Label>
              <Form.Control
                type="date"
                name="published_date"
                value={bookFormData.published_date}
                onChange={handleBookFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Превью (PDF)</Form.Label>
              <Form.Control
                type="file"
                name="preview_file"
                onChange={handleBookFormFileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditBookModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={submitEditBook}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно Редактировать отзыв */}
      <Modal
        show={showEditReviewModal}
        onHide={() => setShowEditReviewModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Редактировать отзыв</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Рейтинг</Form.Label>
              <Form.Control
                type="number"
                name="rating"
                value={reviewFormData.rating}
                onChange={handleReviewFormChange}
                min="1"
                max="5"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Комментарий</Form.Label>
              <Form.Control
                as="textarea"
                name="comment"
                value={reviewFormData.comment}
                onChange={handleReviewFormChange}
              />
            </Form.Group>
            {/* Добавьте другие поля по необходимости */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditReviewModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={submitEditReview}>
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default AdminPanel;
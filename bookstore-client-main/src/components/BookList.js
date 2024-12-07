import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { Link } from 'react-router-dom';

function BookList() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, [filterAuthor, minPrice, maxPrice]);

  const fetchBooks = () => {
    axiosInstance.get('/api/books/', {
      params: {
        author: filterAuthor,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
      },
    })
      .then(response => setBooks(response.data))
      .catch(error => console.error(error));
  };

  const fetchAuthors = () => {
    axiosInstance.get('/api/authors/')
      .then(response => setAuthors(response.data))
      .catch(error => console.error(error));
  };

  return (
    <div className="row">
      <div className="col-md-3">
        <h2>Фильтры</h2>
        <div className="mb-3">
          <label>Автор</label>
          <select className="form-select" value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}>
            <option value="">Все</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>Цена</label>
          <input type="number" className="form-control mb-1" placeholder="Мин" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input type="number" className="form-control" placeholder="Макс" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
      </div>
      <div className="col-md-9">
        <div className="row">
          {books.map(book => (
            <div key={book.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`} className="card-img-top" alt={book.title} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title"><Link to={`/books/${book.id}`}>{book.title}</Link></h5>
                  <p className="card-text flex-grow-1">{book.description.substring(0, 100)}...</p>
                  <p className="card-text"><strong>{book.price} ₴</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookList;
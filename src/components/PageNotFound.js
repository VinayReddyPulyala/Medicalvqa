import React from 'react'
import { Link } from 'react-router-dom';

const PageNotFound = () => {
    return (
        <div className="container text-light">
          <div className="row">
            <div className="col-md-6 offset-md-3 text-center">
              <h1 className="mt-5">404 - Page Not Found</h1>
              <p className="lead">Oops! The page you are looking for does not exist.</p>
              <p className="mb-5">Let's get you back to the <Link to="/">home page</Link>.</p>
            </div>
          </div>
        </div>
      );
    
}

export default PageNotFound

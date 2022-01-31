# Testapi

This is a test api for frontend developers to test there app behaviour 

Might be useful to test the app behaviour in the browser.


Technologies used:

    -sqlite3
    -passport
    -express
    -body-parser
    -jsonwebtoken

Installation:

     npm install
     npm run dev

Migration:

    <code>
      npm run migrate
    </code>


Follwoing are the endpoints:
    /api/v1/auth/login - POST
    /api/v1/auth/signup - POST
    /api/v1/auth/logout - POST
    /api/v1/auth/reset-password/:token - POST

    User endpoints:
    /api/v1/users/:id - GET
    /api/v1/users/:id - PUT
    /api/v1/users/:id - DELETE

    Post endpoints:
    /api/v1/posts - GET
    /api/v1/posts - POST
    /api/v1/posts/:id - GET
    /api/v1/posts/:id - PUT
    /api/v1/posts/:id - DELETE

    Comment endpoints:
    /api/v1/comments - GET
    /api/v1/comments - POST
    /api/v1/comments/:id - GET
    /api/v1/comments/:id - PUT
    /api/v1/comments/:id - DELETE

    admin endpoints:
    /api/v1/admin/users - GET
    /api/v1/admin/users - POST
    /api/v1/admin/users/:id - GET
    /api/v1/admin/users/:id - PUT
    /api/v1/admin/users/:id - DELETE
    /api/v1/admin/users/:id/posts - GET
    /api/v1/admin/users/:id/posts - POST
    /api/v1/admin/users/:id/posts/:id - GET
    /api/v1/admin/users/:id/posts/:id - PUT
    /api/v1/admin/users/:id/posts/:id - DELETE
    /api/v1/admin/users/:id/comments - GET
    /api/v1/admin/users/:id/comments - POST
    /api/v1/admin/users/:id/comments/:id - GET
    /api/v1/admin/users/:id/comments/:id - PUT
    /api/v1/admin/users/:id/comments/:id - DELETE




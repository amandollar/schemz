# API cURL Examples (Postman)

Base URL: `http://localhost:5000/api`  
For protected routes, replace `YOUR_JWT_TOKEN` with the token from login/register. In Postman: **Import** → **Raw text** → paste any curl, or set **Authorization** → **Bearer Token** to `YOUR_JWT_TOKEN`.

---

## Health

```bash
curl -X GET "http://localhost:5000/api/health"
```

---

## Auth

### Register
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123","role":"user"}'
```

### Login
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

### Google login (idToken from Google OAuth)
```bash
curl -X POST "http://localhost:5000/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"idToken":"GOOGLE_ID_TOKEN_HERE"}'
```

### Get current user (protected)
```bash
curl -X GET "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update profile (protected)
```bash
curl -X PUT "http://localhost:5000/api/auth/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"9876543210","state":"Maharashtra","district":"Mumbai","pinCode":"400001"}'
```

### Upload profile image (protected, multipart)
```bash
curl -X POST "http://localhost:5000/api/auth/upload-profile-image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/photo.jpg"
```

### Upload profile documents (protected, multipart)
```bash
curl -X POST "http://localhost:5000/api/auth/upload-profile-documents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "aadhaarDocument=@/path/to/aadhaar.pdf" \
  -F "incomeCertificate=@/path/to/income.pdf" \
  -F "categoryCertificate=@/path/to/category.pdf"
```

---

## Schemes (public / user)

### Get all schemes (public)
```bash
curl -X GET "http://localhost:5000/api/schemes"
```

### Get scheme by ID (public)
```bash
curl -X GET "http://localhost:5000/api/schemes/SCHEME_ID_HERE"
```

### Get matched/eligible schemes (protected, user role)
```bash
curl -X GET "http://localhost:5000/api/schemes/match" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Organizer (protected, organizer role)

### Create scheme
```bash
curl -X POST "http://localhost:5000/api/organizer/scheme" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Scholarship 2025","description":"Education support","benefits":["Tuition fee","Books"],"ministry":"Education","rules":["Must be Indian citizen"]}'
```

### Get my schemes
```bash
curl -X GET "http://localhost:5000/api/organizer/schemes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update scheme
```bash
curl -X PUT "http://localhost:5000/api/organizer/scheme/SCHEME_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","description":"Updated desc","benefits":["Benefit 1"],"ministry":"Education","rules":[]}'
```

### Submit scheme for approval
```bash
curl -X POST "http://localhost:5000/api/organizer/scheme/SCHEME_ID_HERE/submit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete scheme
```bash
curl -X DELETE "http://localhost:5000/api/organizer/scheme/SCHEME_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Application – Organizer application (protected, user role)

### Submit organizer application
```bash
curl -X POST "http://localhost:5000/api/application/organizer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"organization":"NGO Name","designation":"Coordinator","reason":"To run schemes","contactNumber":"9876543210"}'
```

### Get my applications
```bash
curl -X GET "http://localhost:5000/api/application/my-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get application status
```bash
curl -X GET "http://localhost:5000/api/application/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Admin (protected, admin role)

### Get pending schemes
```bash
curl -X GET "http://localhost:5000/api/admin/schemes/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get all schemes (optional query: status)
```bash
curl -X GET "http://localhost:5000/api/admin/schemes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET "http://localhost:5000/api/admin/schemes?status=approved" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Approve scheme
```bash
curl -X POST "http://localhost:5000/api/admin/scheme/SCHEME_ID_HERE/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Approved for launch"}'
```

### Reject scheme
```bash
curl -X POST "http://localhost:5000/api/admin/scheme/SCHEME_ID_HERE/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Incomplete documentation"}'
```

### Toggle scheme status
```bash
curl -X PUT "http://localhost:5000/api/admin/scheme/SCHEME_ID_HERE/toggle" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get pending organizer applications
```bash
curl -X GET "http://localhost:5000/api/admin/applications/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get all organizer applications (optional query: status)
```bash
curl -X GET "http://localhost:5000/api/admin/applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET "http://localhost:5000/api/admin/applications?status=approved" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Approve organizer application
```bash
curl -X POST "http://localhost:5000/api/admin/application/APPLICATION_ID_HERE/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reject organizer application
```bash
curl -X POST "http://localhost:5000/api/admin/application/APPLICATION_ID_HERE/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Does not meet criteria"}'
```

---

## Scheme applications (user / organizer / admin)

### Submit scheme application (protected, user; multipart)
```bash
curl -X POST "http://localhost:5000/api/scheme-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "schemeId=SCHEME_ID_HERE" \
  -F "marksheet=@/path/to/marksheet.pdf" \
  -F "incomeCertificate=@/path/to/income.pdf" \
  -F "categoryCertificate=@/path/to/category.pdf" \
  -F "otherDocuments=@/path/to/doc1.pdf"
```

### Get my scheme applications (protected)
```bash
curl -X GET "http://localhost:5000/api/scheme-applications/my-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Check application for scheme (protected)
```bash
curl -X GET "http://localhost:5000/api/scheme-applications/check/SCHEME_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get applications for a scheme (protected, organizer/admin)
```bash
curl -X GET "http://localhost:5000/api/scheme-applications/scheme/SCHEME_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get all scheme applications (protected, admin; optional query: status, schemeId)
```bash
curl -X GET "http://localhost:5000/api/scheme-applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET "http://localhost:5000/api/scheme-applications?status=pending&schemeId=SCHEME_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Approve scheme application (protected, organizer/admin)
```bash
curl -X PATCH "http://localhost:5000/api/scheme-applications/APPLICATION_ID_HERE/approve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reject scheme application (protected, organizer/admin)
```bash
curl -X PATCH "http://localhost:5000/api/scheme-applications/APPLICATION_ID_HERE/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Documents incomplete"}'
```

---

## Support queries (protected, user/organizer/admin)

### Create support query
```bash
curl -X POST "http://localhost:5000/api/support-queries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Fee refund","message":"I need help with refund process"}'
```

### Get all my queries (optional query: status)
```bash
curl -X GET "http://localhost:5000/api/support-queries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET "http://localhost:5000/api/support-queries?status=open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get query by ID
```bash
curl -X GET "http://localhost:5000/api/support-queries/QUERY_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Send message in query
```bash
curl -X POST "http://localhost:5000/api/support-queries/QUERY_ID_HERE/messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Here are the documents you asked for."}'
```

### Resolve query (admin only)
```bash
curl -X PATCH "http://localhost:5000/api/support-queries/QUERY_ID_HERE/resolve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## AI (protected, organizer role)

### Generate scheme from prompt
```bash
curl -X POST "http://localhost:5000/api/ai/generate-scheme" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a scholarship scheme for engineering students from SC/ST category"}'
```

---

## Postman tips

1. **Import curl**: In Postman, **Import** → **Raw text** → paste a curl from above.
2. **Environment**: Create an env with `baseUrl = http://localhost:5000/api` and `token = YOUR_JWT_TOKEN`, then use `{{baseUrl}}` and `{{token}}` in requests.
3. **Auth**: Set **Authorization** → **Type: Bearer Token** → **Token: `{{token}}`** for protected routes.
4. **IDs**: Replace placeholders like `SCHEME_ID_HERE`, `QUERY_ID_HERE`, `APPLICATION_ID_HERE` with real IDs from previous responses.

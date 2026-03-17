## API Endpoints Necessários para o Backend Java

Este documento descreve os endpoints esperados que o backend em Java deve implementar para que o frontend funcione corretamente.

### Base URL
```
http://localhost:8080/api
```

### Autenticação (Auth)

#### POST `/auth/login`
Realiza login do usuário.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

#### POST `/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password",
  "passwordConfirm": "password",
  "name": "New User"
}
```

**Response (201):**
Same as login response

#### POST `/auth/refresh`
Atualiza o token de autenticação.

**Response (200):**
Same as login response

#### GET `/auth/me`
Obtém dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "usr-1",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin"
}
```

---

### Seasons (Temporadas)

#### GET `/seasons`
Lista todas as temporadas.

**Response (200):**
```json
[
  {
    "id": "s1",
    "name": "Season 1: Genesis",
    "year": 2024
  }
]
```

#### GET `/seasons/{id}`
Obtém uma temporada específica.

**Response (200):**
```json
{
  "id": "s1",
  "name": "Season 1: Genesis",
  "year": 2024
}
```

#### POST `/seasons`
Cria uma nova temporada.

**Request:**
```json
{
  "name": "Season 3: Awakening",
  "year": 2026
}
```

**Response (201):**
Same as GET response

#### PUT `/seasons/{id}`
Atualiza uma temporada.

**Request:**
```json
{
  "name": "Season 1: Genesis Updated",
  "year": 2024
}
```

**Response (200):**
Same as GET response

#### DELETE `/seasons/{id}`
Deleta uma temporada.

**Response (204):** No content

---

### Championships (Campeonatos)

#### GET `/championships`
Lista todos os campeonatos.

**Query Parameters:**
- `seasonId` (optional): Filtrar por ID da temporada

**Response (200):**
```json
[
  {
    "id": "c1",
    "name": "ARAM Cup #1",
    "description": "The inaugural ARAM championship.",
    "seasonId": "s1",
    "status": "finished"
  }
]
```

#### GET `/championships/{id}`
Obtém um campeonato específico.

**Response (200):**
Same as list response item

#### POST `/championships`
Cria um novo campeonato.

**Request:**
```json
{
  "name": "ARAM Cup #3",
  "description": "Third ARAM championship",
  "seasonId": "s1",
  "status": "upcoming"
}
```

**Response (201):**
Same as GET response

#### PUT `/championships/{id}`
Atualiza um campeonato.

**Request:**
```json
{
  "name": "ARAM Cup #1 Updated",
  "description": "Updated description",
  "status": "ongoing"
}
```

**Response (200):**
Same as GET response

#### DELETE `/championships/{id}`
Deleta um campeonato.

**Response (204):** No content

---

### Teams (Times)

#### GET `/teams`
Lista todos os times.

**Response (200):**
```json
[
  {
    "id": "t1",
    "name": "Shadow Wolves",
    "tag": "SHW",
    "description": "Aggressive early-game team.",
    "logoUrl": "https://..."
  }
]
```

#### GET `/teams/{id}`
Obtém um time específico.

**Response (200):**
Same as list response item

#### POST `/teams`
Cria um novo time.

**Request:**
```json
{
  "name": "New Team",
  "tag": "NEW",
  "description": "Team description"
}
```

**Response (201):**
Same as GET response

#### PUT `/teams/{id}`
Atualiza um time.

**Request:**
```json
{
  "name": "Updated Team Name",
  "tag": "UPD",
  "description": "Updated description"
}
```

**Response (200):**
Same as GET response

#### POST `/teams/{id}/logo`
Faz upload do logo do time (multipart/form-data).

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
```
file: File
```

**Response (200):**
```json
{
  "id": "t1",
  "name": "Team Name",
  "tag": "TAG",
  "description": "...",
  "logoUrl": "https://..."
}
```

#### DELETE `/teams/{id}`
Deleta um time.

**Response (204):** No content

---

### Players (Jogadores)

#### GET `/players`
Lista todos os jogadores.

**Query Parameters:**
- `teamId` (optional): Filtrar por ID do time

**Response (200):**
```json
[
  {
    "id": "p1",
    "nickname": "Darkflow",
    "tag": "DRK",
    "teamId": "t1",
    "isCaptain": true,
    "notes": "Optional notes"
  }
]
```

#### GET `/players/{id}`
Obtém um jogador específico.

**Response (200):**
Same as list response item

#### POST `/players`
Cria um novo jogador.

**Request:**
```json
{
  "nickname": "NewPlayer",
  "tag": "NEW",
  "teamId": "t1",
  "isCaptain": false,
  "notes": "Optional notes"
}
```

**Response (201):**
Same as GET response

#### PUT `/players/{id}`
Atualiza um jogador.

**Request:**
```json
{
  "nickname": "UpdatedNickname",
  "isCaptain": true,
  "notes": "Updated notes"
}
```

**Response (200):**
Same as GET response

#### DELETE `/players/{id}`
Deleta um jogador.

**Response (204):** No content

---

### Matches (Partidas)

#### GET `/matches`
Lista todas as partidas.

**Query Parameters:**
- `championshipId` (optional): Filtrar por ID do campeonato
- `teamId` (optional): Filtrar por ID do time

**Response (200):**
```json
[
  {
    "id": "m1",
    "championshipId": "c3",
    "teamAId": "t1",
    "teamBId": "t2",
    "scheduledAt": "2025-03-10T20:00:00Z",
    "scoreA": 1,
    "scoreB": 0,
    "comment": "Optional match comment",
    "mvpPlayerId": "p1"
  }
]
```

#### GET `/matches/{id}`
Obtém uma partida específica.

**Response (200):**
Same as list response item

#### POST `/matches`
Cria uma nova partida.

**Request:**
```json
{
  "championshipId": "c3",
  "teamAId": "t1",
  "teamBId": "t2",
  "scheduledAt": "2025-03-10T20:00:00Z",
  "scoreA": 0,
  "scoreB": 0
}
```

**Response (201):**
Same as GET response

#### PUT `/matches/{id}`
Atualiza uma partida.

**Request:**
```json
{
  "scoreA": 2,
  "scoreB": 1,
  "mvpPlayerId": "p1",
  "comment": "Great match!"
}
```

**Response (200):**
Same as GET response

#### DELETE `/matches/{id}`
Deleta uma partida.

**Response (204):** No content

---

### Standings (Classificações)

#### GET `/standings`
Lista todas as classificações.

**Query Parameters:**
- `championshipId` (required): ID do campeonato

**Response (200):**
```json
[
  {
    "id": "ct1",
    "championshipId": "c3",
    "teamId": "t1",
    "wins": 2,
    "losses": 0,
    "points": 6
  }
]
```

#### GET `/standings/{id}`
Obtém uma classificação específica.

**Response (200):**
Same as list response item

#### POST `/standings`
Cria uma nova classificação (normalmente feito automaticamente).

**Request:**
```json
{
  "championshipId": "c3",
  "teamId": "t1",
  "wins": 0,
  "losses": 0,
  "points": 0
}
```

**Response (201):**
Same as GET response

#### PUT `/standings/{id}`
Atualiza uma classificação.

**Request:**
```json
{
  "wins": 3,
  "losses": 0,
  "points": 9
}
```

**Response (200):**
Same as GET response

#### DELETE `/standings/{id}`
Deleta uma classificação.

**Response (204):** No content

---

### Error Handling

Todos os endpoints devem retornar erros com o seguinte formato:

**Response (400, 401, 403, 404, 500, etc):**
```json
{
  "message": "Error description",
  "errors": {
    "fieldName": ["Error message for this field"]
  }
}
```

---

### Authentication Headers

Todos os endpoints protegidos (exceto login e register) devem incluir:

```
Authorization: Bearer {token}
```

O token é um JWT que deve ser armazenado no localStorage pelo frontend.

---

### Notas Importantes

1. **CORS**: O backend deve permitir requisições do frontend (localhost:5173 em dev)
2. **Timestamps**: Use ISO 8601 format (2025-03-10T20:00:00Z)
3. **Status Codes**: 
   - 200: Success
   - 201: Created
   - 204: No Content (para DELETE)
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error
4. **Validações**: O backend deve validar todos os campos obrigatórios
5. **Cálculo automático de standings**: Quando uma partida é criada/atualizada, as classificações devem ser atualizadas automaticamente

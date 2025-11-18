# InfoPanama API

FastAPI backend para procesamiento de IA, ingesta de datos y gestión de verificaciones.

## 🚀 Setup

### Requisitos

- Python 3.11+
- Poetry

### Instalación

```bash
cd packages/api

# Instalar Poetry (si no lo tienes)
curl -sSL https://install.python-poetry.org | python3 -

# Instalar dependencias
poetry install

# Activar entorno virtual
poetry shell
```

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Convex
CONVEX_DEPLOYMENT=your_deployment
CONVEX_URL=your_url

# OpenAI
OPENAI_API_KEY=your_key

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_key

# DigitalOcean Spaces
DO_SPACES_KEY=your_key
DO_SPACES_SECRET=your_secret
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=infopanama-snapshots
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
poetry run uvicorn app.main:app --reload

# O usar el script de desarrollo
poetry run python -m app.main
```

La API estará disponible en: http://localhost:8000

- Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 📁 Estructura

```
app/
├── api/
│   └── v1/
│       ├── endpoints/          # Endpoints de la API
│       │   ├── claims.py
│       │   ├── verdicts.py
│       │   ├── actors.py
│       │   └── ingest.py
│       └── router.py
├── core/
│   ├── config.py              # Configuración
│   └── security.py            # Autenticación y seguridad
├── models/
│   └── schemas.py             # Modelos Pydantic
├── services/
│   ├── ai/
│   │   ├── verification.py    # Verificación con GPT
│   │   ├── rag.py             # RAG system
│   │   └── embeddings.py      # Embeddings
│   ├── nlp/
│   │   ├── ner.py             # Named Entity Recognition
│   │   ├── sentiment.py       # Análisis de sentimiento
│   │   └── topics.py          # Topic modeling
│   └── storage/
│       ├── convex.py          # Convex client
│       ├── qdrant.py          # Qdrant client
│       └── spaces.py          # DO Spaces client
└── main.py
```

## 🔌 Endpoints

### Claims

- `GET /api/v1/claims` - Listar claims
- `GET /api/v1/claims/{id}` - Obtener claim
- `POST /api/v1/claims` - Crear claim

### Verdicts

- `GET /api/v1/verdicts/{claim_id}` - Obtener veredicto
- `POST /api/v1/verdicts` - Crear veredicto

### Actors

- `GET /api/v1/actors` - Listar actores
- `GET /api/v1/actors/{id}` - Obtener actor
- `POST /api/v1/actors` - Crear actor
- `PUT /api/v1/actors/{id}/due-diligence` - Completar DD

### Ingest

- `POST /api/v1/ingest/article` - Ingerir artículo
- `POST /api/v1/ingest/claim` - Ingerir claim

## 🧪 Testing

```bash
# Ejecutar tests
poetry run pytest

# Con cobertura
poetry run pytest --cov=app tests/

# Tests específicos
poetry run pytest tests/test_claims.py
```

## 🎨 Linting y Formateo

```bash
# Black (formateo)
poetry run black app/ tests/

# Ruff (linting)
poetry run ruff check app/ tests/

# MyPy (type checking)
poetry run mypy app/
```

## 📦 Deploy

```bash
# Build
poetry build

# Instalar dependencias de producción
poetry install --only main

# Ejecutar con Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔧 Servicios

### IA y Verificación

```python
from app.services.ai.verification import verify_claim

result = await verify_claim(
    claim_text="Claim to verify",
    context_docs=["doc1", "doc2"]
)
```

### RAG (Retrieval-Augmented Generation)

```python
from app.services.ai.rag import search_context

context = await search_context(
    query="search query",
    collection="infopanama_vectors",
    limit=10
)
```

### Embeddings

```python
from app.services.ai.embeddings import generate_embedding

embedding = await generate_embedding("text to embed")
```

## 📊 Monitoring

- Sentry para error tracking
- Prometheus metrics en `/metrics`
- Health check en `/health`

## 🔐 Seguridad

- JWT authentication
- Rate limiting
- CORS configurado
- API keys para scrapers
- Audit logs en Convex

## 📚 Documentación Adicional

- [Guía de Verificación](../../docs/verification.md)
- [Guía de Due Diligence](../../docs/due-diligence.md)
- [API Reference completo](../../docs/api.md)

#!/bin/bash
set -e

# Setup script for AFYA-C Phase 1

echo "=== AFYA-C Phase 1 Setup ==="

echo "\n1. Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/afya_c
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    depends_on:
      - postgres
      - redis
      - minio
    restart: unless-stopped

  web:
    build: ./apps/web
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:3000/api
    depends_on:
      - api
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=afya_c
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./apps/api/prisma/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@afya.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
EOF

echo "2. Creating project structure..."
mkdir -p apps/api/src/modules
mkdir -p apps/web/src
mkdir -p libs/schemas libs/types libs/utils

echo "3. Creating TypeScript configs..."
cat > tsconfig.nest.json << 'EOF'
{
  "extends": "@nx/typescript",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nx/nest-typeorm/plugin",
        "options": {
          "root": "apps/api/src",
          "sourceRoot": "apps/api/src"
        }
      }
    ]
  },
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.js", "**/*.test.js"]
}
EOF

cat > tsconfig.react.json << 'EOF'
{
  "extends": "@nx/react",
  "compilerOptions": {
    "resolveJsonModule": true,
    "allowJs": false,
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@afya-core/*": ["libs/*/src"],
      "@shared/*": ["libs/*/src"]
    }
  },
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "**/*.spec.js", "**/*.test.js"]
}
EOF

echo "4. Setup complete!"
echo "\nNext steps:"
echo "  npm install"
echo "  npx nx init"
echo "  npx prisma init"
echo "  ./apps/api/scripts/generate-api.sh"
echo "  npm run build"

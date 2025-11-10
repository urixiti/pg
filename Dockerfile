# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (no frozen lockfile to allow updates)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA served under /pg path
RUN echo 'server { \
    listen 80; \
    # Serve /pg path by aliasing to root \
    location /pg/ { \
        alias /usr/share/nginx/html/; \
        try_files $uri $uri/ /index.html; \
        index index.html; \
    } \
    # Handle /pg without trailing slash (preserve query string) \
    location = /pg { \
        return 301 /pg/$is_args$args; \
    } \
    # Redirect root to /pg \
    location = / { \
        return 301 /pg/; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

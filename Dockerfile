# =========================
# Stage 1 — Build React App
# =========================
FROM node:18-alpine AS builder

WORKDIR /app

# Reduce noise / speed up
ENV npm_config_loglevel=warn
ENV CI=true

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy rest of app
COPY . .

# Build React app
RUN npm run build


# =========================
# Stage 2 — Nginx Runtime
# =========================
FROM nginx:1.27-alpine

# Remove default config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy your custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
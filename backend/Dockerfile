FROM node:lts-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY app ./app
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++ \
  && addgroup -S vela && adduser -S vela -G vela
COPY package*.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force \
  && apk del python3 make g++
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/db && chown -R vela:vela /app
USER vela
EXPOSE 3000
CMD ["node", "dist/main.js"]

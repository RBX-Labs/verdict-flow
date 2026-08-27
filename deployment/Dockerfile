FROM node:22-alpine

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
COPY README.md ./README.md

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.mjs"]

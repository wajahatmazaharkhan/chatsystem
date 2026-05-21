FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["node","backend/server.js"]

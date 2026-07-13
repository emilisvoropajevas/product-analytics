FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY ./ /app/

ARG VITE_API_URL

RUN npm run build

EXPOSE 4173

CMD [ "npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173" ]
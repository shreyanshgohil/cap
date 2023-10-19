FROM node:16-alpine

WORKDIR /app

COPY ./ ./
RUN npm install

# Assuming your build script is "build" (adjust if needed)
RUN npm run build

COPY ./ ./

CMD ["npm", "run", "prod"]

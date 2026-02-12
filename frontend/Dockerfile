# Stage 1: Build Stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Stage (Nginx පාවිච්චි කිරීම)
FROM nginx:stable-alpine
# React build වුණු files ටික nginx එකට දානවා
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
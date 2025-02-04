# Step 1: Build the Angular app
FROM node:20.16.0 as build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Use nginx to serve the app
FROM nginx:1.25-alpine
# Update this path to match the correct build output
COPY --from=build-stage /app/dist/hermanas-fe/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
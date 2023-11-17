FROM nginx:1.21

# COPY ./nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
# COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
# COPY ./nginx/ssl /etc/nginx/ssl
COPY ./nginx /etc/nginx

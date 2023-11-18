FROM nginx:1.21

COPY ./nginx/conf.d/nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/ssl/certs/ /etc/ssl/certs/nginx/
COPY ./nginx/ssl/ssl.conf /etc/nginx/ssl/ssl.conf
# COPY ./nginx /etc/nginx
